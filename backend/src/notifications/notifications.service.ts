import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema.js';

export interface CreateNotificationEntry {
  userId: string;
  type: NotificationType;
  transactionId?: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  create(entry: CreateNotificationEntry): Promise<NotificationDocument> {
    return this.notificationModel.create(entry);
  }

  findForUser(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOneAndUpdate({ _id: id, userId }, { $set: { read: true } }, { new: true })
      .exec();
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany({ userId, read: false }, { $set: { read: true } }).exec();
    return { modifiedCount: result.modifiedCount };
  }
}
