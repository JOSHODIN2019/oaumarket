import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema.js';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async add(dto: CreateFavoriteDto): Promise<{ saved: boolean }> {
    await this.favoriteModel
      .updateOne({ userId: dto.userId, productId: dto.productId }, { $setOnInsert: dto }, { upsert: true })
      .exec();
    return { saved: true };
  }

  async remove(userId: string, productId: string): Promise<{ saved: boolean }> {
    await this.favoriteModel.deleteOne({ userId, productId }).exec();
    return { saved: false };
  }

  async findForUser(userId: string): Promise<string[]> {
    const rows = await this.favoriteModel.find({ userId }).select({ productId: 1 }).exec();
    return rows.map((row) => row.productId);
  }
}
