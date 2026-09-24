import { vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications/notifications.service.js';
import { Transaction } from './schemas/transaction.schema.js';
import { TransactionsService } from './transactions.service.js';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionModel: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };
  let notificationsService: { create: ReturnType<typeof vi.fn> };

  const buyerId = '507f1f77bcf86cd799439011';
  const sellerId = '507f1f77bcf86cd799439012';

  beforeEach(async () => {
    transactionModel = { create: vi.fn(), findById: vi.fn(), find: vi.fn() };
    notificationsService = { create: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getModelToken(Transaction.name), useValue: transactionModel },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  describe('create', () => {
    it('rejects a buyer transacting with themselves', async () => {
      await expect(
        service.create({ buyerId, sellerId: buyerId, productId: 'product-1', amount: 1000, paymentMethod: 'card' }),
      ).rejects.toThrow(BadRequestException);
      expect(transactionModel.create).not.toHaveBeenCalled();
    });

    it('creates a transaction defaulting to "pending" status', async () => {
      transactionModel.create.mockResolvedValue({ status: 'pending' });
      const result = await service.create({ buyerId, sellerId, productId: 'product-1', amount: 1000, paymentMethod: 'card' });
      expect(result.status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('rejects a malformed id without querying the database', async () => {
      await expect(service.findById('not-a-valid-id')).rejects.toThrow(NotFoundException);
      expect(transactionModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    function pendingTransaction() {
      return {
        _id: { toString: () => 'transaction-1' },
        buyerId,
        sellerId,
        status: 'pending',
        save: vi.fn().mockResolvedValue(undefined),
      };
    }

    it('lets the buyer mark a pending transaction completed', async () => {
      const transaction = pendingTransaction();
      transactionModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(transaction) });

      const result = await service.updateStatus(buyerId, 'completed', buyerId);

      expect(result.status).toBe('completed');
      expect(transaction.save).toHaveBeenCalled();
    });

    it('notifies the other party, not the actor', async () => {
      const transaction = pendingTransaction();
      transactionModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(transaction) });

      await service.updateStatus(buyerId, 'completed', buyerId);

      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: sellerId, type: 'transaction_completed' }),
      );
    });

    it('rejects an actor who is neither buyer nor seller', async () => {
      const transaction = pendingTransaction();
      transactionModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(transaction) });

      await expect(service.updateStatus(buyerId, 'completed', 'a-stranger')).rejects.toThrow(ForbiddenException);
    });

    it('rejects updating a transaction that already left "pending"', async () => {
      const transaction = { ...pendingTransaction(), status: 'completed' };
      transactionModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(transaction) });

      await expect(service.updateStatus(buyerId, 'cancelled', buyerId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findForUser', () => {
    it('queries for transactions where the user is either buyer or seller', async () => {
      const sortMock = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) });
      transactionModel.find.mockReturnValue({ sort: sortMock });

      await service.findForUser(buyerId);

      expect(transactionModel.find).toHaveBeenCalledWith({ $or: [{ buyerId }, { sellerId: buyerId }] });
    });
  });
});
