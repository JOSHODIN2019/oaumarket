import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { Message, MessageDocument } from './schemas/message.schema.js';

export interface ConversationSummary {
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async send(dto: CreateMessageDto): Promise<MessageDocument> {
    if (dto.buyerId === dto.sellerId) {
      throw new BadRequestException('A buyer and seller cannot be the same person.');
    }
    if (dto.senderId !== dto.buyerId && dto.senderId !== dto.sellerId) {
      throw new BadRequestException('senderId must be the buyer or the seller.');
    }

    const message = await this.messageModel.create(dto);

    const recipientId = dto.senderId === dto.buyerId ? dto.sellerId : dto.buyerId;
    await this.notificationsService.create({
      userId: recipientId,
      type: 'new_message',
      message: `New message about "${dto.productTitle}".`,
    });

    return message;
  }

  // Every message in one thread, oldest first. `viewerId` (whichever
  // side is opening the thread) has the other side's messages marked
  // read as a side effect - the same "open it, it's read" behavior
  // any chat app has.
  async findConversation(
    productId: string,
    buyerId: string,
    sellerId: string,
    viewerId?: string,
  ): Promise<MessageDocument[]> {
    if (viewerId) {
      await this.messageModel
        .updateMany({ productId, buyerId, sellerId, senderId: { $ne: viewerId }, read: false }, { $set: { read: true } })
        .exec();
    }
    return this.messageModel.find({ productId, buyerId, sellerId }).sort({ createdAt: 1 }).exec();
  }

  // Every conversation `userId` is part of, newest activity first -
  // grouped here rather than with a real aggregation pipeline; at this
  // scale (one student's own conversations) a plain fetch-and-group is
  // simpler and just as correct.
  async findInbox(userId: string): Promise<ConversationSummary[]> {
    const messages = await this.messageModel
      .find({ $or: [{ buyerId: userId }, { sellerId: userId }] })
      .sort({ createdAt: 1 })
      .exec();

    const byConversation = new Map<string, ConversationSummary>();
    for (const message of messages) {
      const key = `${message.productId}:${message.buyerId}:${message.sellerId}`;
      const existing = byConversation.get(key);
      const isUnreadForViewer = !message.read && message.senderId !== userId;
      if (existing) {
        existing.lastMessage = message.text;
        existing.lastMessageAt = message.createdAt;
        if (isUnreadForViewer) existing.unreadCount += 1;
      } else {
        byConversation.set(key, {
          productId: message.productId,
          productTitle: message.productTitle,
          buyerId: message.buyerId,
          buyerName: message.buyerName,
          sellerId: message.sellerId,
          sellerName: message.sellerName,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          unreadCount: isUnreadForViewer ? 1 : 0,
        });
      }
    }

    return Array.from(byConversation.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
    );
  }
}
