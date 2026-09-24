import { vi } from 'vitest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Favorite } from './schemas/favorite.schema.js';
import { FavoritesService } from './favorites.service.js';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoriteModel: {
    updateOne: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    favoriteModel = {
      updateOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
      deleteOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
      find: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoritesService, { provide: getModelToken(Favorite.name), useValue: favoriteModel }],
    }).compile();

    service = module.get(FavoritesService);
  });

  it('upserts the favorite rather than erroring on a duplicate save', async () => {
    const result = await service.add({ userId: 'user-1', productId: 'product-1' });
    expect(favoriteModel.updateOne).toHaveBeenCalledWith(
      { userId: 'user-1', productId: 'product-1' },
      { $setOnInsert: { userId: 'user-1', productId: 'product-1' } },
      { upsert: true },
    );
    expect(result).toEqual({ saved: true });
  });

  it('deletes the favorite', async () => {
    const result = await service.remove('user-1', 'product-1');
    expect(favoriteModel.deleteOne).toHaveBeenCalledWith({ userId: 'user-1', productId: 'product-1' });
    expect(result).toEqual({ saved: false });
  });

  it('returns just the productId of each row', async () => {
    favoriteModel.find.mockReturnValue({
      select: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([{ productId: 'product-1' }, { productId: 'product-2' }]),
      }),
    });
    await expect(service.findForUser('user-1')).resolves.toEqual(['product-1', 'product-2']);
  });
});
