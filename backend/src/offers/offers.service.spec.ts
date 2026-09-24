import { vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ProductsService } from '../products/products.service.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { Offer } from './schemas/offer.schema.js';
import { OffersService } from './offers.service.js';

describe('OffersService', () => {
  let service: OffersService;
  let offerModel: { create: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn>; find: ReturnType<typeof vi.fn> };
  let transactionsService: { create: ReturnType<typeof vi.fn> };
  let notificationsService: { create: ReturnType<typeof vi.fn> };
  let productsService: { findById: ReturnType<typeof vi.fn> };

  const buyerId = 'buyer-1';
  const sellerId = 'seller-1';

  beforeEach(async () => {
    offerModel = { create: vi.fn(), findById: vi.fn(), find: vi.fn() };
    transactionsService = { create: vi.fn().mockResolvedValue({ _id: { toString: () => 'transaction-1' } }) };
    notificationsService = { create: vi.fn().mockResolvedValue(undefined) };
    productsService = { findById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: getModelToken(Offer.name), useValue: offerModel },
        { provide: TransactionsService, useValue: transactionsService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get(OffersService);
  });

  describe('create', () => {
    it('rejects a buyer offering to themselves', async () => {
      await expect(
        service.create({ productId: 'p1', buyerId, sellerId: buyerId, offerType: 'cash', offerAmount: 1000 }),
      ).rejects.toThrow(BadRequestException);
      expect(offerModel.create).not.toHaveBeenCalled();
    });

    it('creates a cash offer as-is', async () => {
      offerModel.create.mockResolvedValue({ offerType: 'cash', offerAmount: 1000 });
      await service.create({ productId: 'p1', buyerId, sellerId, offerType: 'cash', offerAmount: 1000 });
      expect(offerModel.create).toHaveBeenCalled();
      expect(productsService.findById).not.toHaveBeenCalled();
    });

    it('rejects a barter offer for a listing the buyer does not own', async () => {
      productsService.findById.mockResolvedValue({ _id: { toString: () => 'p2' }, sellerId: 'someone-else', available: true });
      await expect(
        service.create({ productId: 'p1', buyerId, sellerId, offerType: 'barter', offeredProductId: 'p2' }),
      ).rejects.toThrow(BadRequestException);
      expect(offerModel.create).not.toHaveBeenCalled();
    });

    it('rejects a barter offer for an unavailable listing', async () => {
      productsService.findById.mockResolvedValue({ _id: { toString: () => 'p2' }, sellerId: buyerId, available: false });
      await expect(
        service.create({ productId: 'p1', buyerId, sellerId, offerType: 'barter', offeredProductId: 'p2' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a valid barter offer', async () => {
      productsService.findById.mockResolvedValue({ _id: { toString: () => 'p2' }, title: 'Calculator', sellerId: buyerId, available: true });
      offerModel.create.mockResolvedValue({ offerType: 'barter', offeredProductId: 'p2' });
      await service.create({ productId: 'p1', buyerId, sellerId, offerType: 'barter', offeredProductId: 'p2' });
      expect(offerModel.create).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: sellerId, message: expect.stringContaining('Calculator') }),
      );
    });
  });

  describe('findById', () => {
    it('rejects a malformed id', async () => {
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('accept', () => {
    function pendingOffer(overrides = {}) {
      return {
        buyerId,
        sellerId,
        productId: 'p1',
        offerType: 'cash',
        offerAmount: 1000,
        status: 'pending',
        save: vi.fn().mockResolvedValue(undefined),
        ...overrides,
      };
    }

    it('rejects a non-seller trying to accept', async () => {
      const offer = pendingOffer();
      offerModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(offer) });
      await expect(service.accept('507f1f77bcf86cd799439011', buyerId)).rejects.toThrow(ForbiddenException);
      expect(transactionsService.create).not.toHaveBeenCalled();
    });

    it('creates a real transaction at the offer amount and marks accepted', async () => {
      const offer = pendingOffer();
      offerModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(offer) });

      const result = await service.accept('507f1f77bcf86cd799439011', sellerId);

      expect(transactionsService.create).toHaveBeenCalledWith({ buyerId, sellerId, productId: 'p1', amount: 1000, paymentMethod: 'cash_on_pickup' });
      expect(result.status).toBe('accepted');
      expect(result.transactionId).toBe('transaction-1');
    });

    it('rejects accepting a non-pending offer', async () => {
      const offer = pendingOffer({ status: 'declined' });
      offerModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(offer) });
      await expect(service.accept('507f1f77bcf86cd799439011', sellerId)).rejects.toThrow(BadRequestException);
    });

    it('accepts a barter offer without creating a transaction', async () => {
      const offer = pendingOffer({ offerType: 'barter', offerAmount: undefined, offeredProductId: 'p2' });
      offerModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(offer) });

      const result = await service.accept('507f1f77bcf86cd799439011', sellerId);

      expect(transactionsService.create).not.toHaveBeenCalled();
      expect(result.status).toBe('accepted');
      expect(result.transactionId).toBeUndefined();
    });
  });

  describe('withdraw', () => {
    it('rejects a non-buyer trying to withdraw', async () => {
      const offer = { sellerId, buyerId, status: 'pending', save: vi.fn() };
      offerModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(offer) });
      await expect(service.withdraw('507f1f77bcf86cd799439011', sellerId)).rejects.toThrow(ForbiddenException);
    });
  });
});
