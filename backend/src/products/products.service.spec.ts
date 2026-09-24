import { vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from './schemas/product.schema.js';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    updateOne: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
    countDocuments: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    productModel = {
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      updateOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(undefined) }),
      deleteOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(undefined) }),
      countDocuments: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(0) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, { provide: getModelToken(Product.name), useValue: productModel }],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('sorts by newest first with no filter', async () => {
      const sortMock = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) });
      productModel.find.mockReturnValue({ sort: sortMock });

      await service.findAll();

      expect(productModel.find).toHaveBeenCalledWith({});
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('filters by categoryId when provided', async () => {
      const sortMock = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) });
      productModel.find.mockReturnValue({ sort: sortMock });

      await service.findAll('electronics');

      expect(productModel.find).toHaveBeenCalledWith({ categoryId: 'electronics' });
    });
  });

  describe('findById', () => {
    it('rejects a malformed id without querying', async () => {
      await expect(service.findById('not-an-id')).rejects.toThrow(NotFoundException);
      expect(productModel.findById).not.toHaveBeenCalled();
    });

    it('rejects a well-formed id with no matching listing', async () => {
      productModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
      await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    function existingProduct() {
      return {
        _id: '507f1f77bcf86cd799439011',
        sellerId: 'seller-1',
        title: 'Old Title',
        price: 1000,
        save: vi.fn().mockResolvedValue(undefined),
      };
    }

    it('rejects an actor who is not the seller', async () => {
      const product = existingProduct();
      productModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(product) });

      await expect(
        service.update('507f1f77bcf86cd799439011', { actorId: 'a-stranger', title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
      expect(product.save).not.toHaveBeenCalled();
    });

    it('applies only the fields provided', async () => {
      const product = existingProduct();
      productModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(product) });

      const result = await service.update('507f1f77bcf86cd799439011', { actorId: 'seller-1', title: 'New Title' });

      expect(result.title).toBe('New Title');
      expect(result.price).toBe(1000);
    });
  });

  describe('remove', () => {
    it('rejects an actor who is not the seller', async () => {
      const product = { _id: '507f1f77bcf86cd799439011', sellerId: 'seller-1' };
      productModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(product) });

      await expect(service.remove('507f1f77bcf86cd799439011', 'a-stranger')).rejects.toThrow(ForbiddenException);
      expect(productModel.deleteOne).not.toHaveBeenCalled();
    });

    it('deletes the listing when the actor is the seller', async () => {
      const product = { _id: '507f1f77bcf86cd799439011', sellerId: 'seller-1' };
      productModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(product) });

      await service.remove('507f1f77bcf86cd799439011', 'seller-1');

      expect(productModel.deleteOne).toHaveBeenCalledWith({ _id: product._id });
    });
  });
});
