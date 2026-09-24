import { vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Category } from './schemas/category.schema.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: {
    countDocuments: ReturnType<typeof vi.fn>;
    insertMany: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    categoryModel = {
      countDocuments: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(0) }),
      insertMany: vi.fn().mockResolvedValue(undefined),
      find: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      deleteOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(undefined) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: getModelToken(Category.name), useValue: categoryModel }],
    }).compile();

    service = module.get(CategoriesService);
  });

  describe('onModuleInit', () => {
    it('seeds default categories when the collection is empty', async () => {
      await service.onModuleInit();
      const seeded = categoryModel.insertMany.mock.calls[0][0];
      expect(seeded).toEqual(expect.arrayContaining([expect.objectContaining({ slug: 'electronics' })]));
    });

    it('swallows a duplicate-key error from a concurrent seed race', async () => {
      categoryModel.insertMany.mockRejectedValueOnce({ code: 11000 });
      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });

    it('re-throws a non-duplicate-key error', async () => {
      categoryModel.insertMany.mockRejectedValueOnce(new Error('connection lost'));
      await expect(service.onModuleInit()).rejects.toThrow('connection lost');
    });

    it('does not seed when categories already exist', async () => {
      categoryModel.countDocuments.mockReturnValue({ exec: vi.fn().mockResolvedValue(3) });
      await service.onModuleInit();
      expect(categoryModel.insertMany).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('rejects a duplicate slug', async () => {
      categoryModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ slug: 'books' }) });
      await expect(service.create({ name: 'Books', slug: 'books' })).rejects.toThrow(ConflictException);
      expect(categoryModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('rejects a malformed id without querying the database', async () => {
      await expect(service.findById('not-a-valid-id')).rejects.toThrow(NotFoundException);
      expect(categoryModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the category by id', async () => {
      const category = { _id: '507f1f77bcf86cd799439011' };
      categoryModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(category) });
      await service.remove('507f1f77bcf86cd799439011');
      expect(categoryModel.deleteOne).toHaveBeenCalledWith({ _id: category._id });
    });
  });
});
