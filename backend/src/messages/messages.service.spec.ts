import { vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications/notifications.service.js';
import { Message } from './schemas/message.schema.js';
import { MessagesService } from './messages.service.js';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageModel: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  let notificationsService: { create: ReturnType<typeof vi.fn> };

  const buyerId = 'buyer-1';
  const sellerId = 'seller-1';

  beforeEach(async () => {
    messageModel = {
      create: vi.fn(),
      find: vi.fn(),
      updateMany: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(undefined) }),
    };
    notificationsService = { create: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getModelToken(Message.name), useValue: messageModel },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(MessagesService);
  });

  describe('send', () => {
    const baseDto = {
      productId: 'p1',
      productTitle: 'Desk Lamp',
      buyerId,
      buyerName: 'Buyer',
      sellerId,
      sellerName: 'Seller',
      senderId: buyerId,
      text: 'Is this still available?',
    };

    it('rejects buyer and seller being the same person', async () => {
      await expect(service.send({ ...baseDto, sellerId: buyerId })).rejects.toThrow(BadRequestException);
      expect(messageModel.create).not.toHaveBeenCalled();
    });

    it('rejects a sender who is neither the buyer nor the seller', async () => {
      await expect(service.send({ ...baseDto, senderId: 'a-stranger' })).rejects.toThrow(BadRequestException);
    });

    it('sends the message and notifies the other party', async () => {
      messageModel.create.mockResolvedValue({ ...baseDto });
      await service.send(baseDto);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: sellerId, type: 'new_message' }),
      );
    });
  });

  describe('findInbox', () => {
    it('groups messages into one conversation per productId/buyer/seller', async () => {
      const now = new Date();
      messageModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([
            {
              productId: 'p1',
              productTitle: 'Desk Lamp',
              buyerId,
              buyerName: 'Buyer',
              sellerId,
              sellerName: 'Seller',
              senderId: buyerId,
              text: 'Hi',
              read: true,
              createdAt: now,
            },
            {
              productId: 'p1',
              productTitle: 'Desk Lamp',
              buyerId,
              buyerName: 'Buyer',
              sellerId,
              sellerName: 'Seller',
              senderId: sellerId,
              text: 'Still available!',
              read: false,
              createdAt: now,
            },
          ]),
        }),
      });

      const result = await service.findInbox(buyerId);
      expect(result).toHaveLength(1);
      expect(result[0].lastMessage).toBe('Still available!');
      expect(result[0].unreadCount).toBe(1);
    });
  });
});
