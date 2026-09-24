import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product, ProductDocument } from './schemas/product.schema.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  create(dto: CreateProductDto): Promise<ProductDocument> {
    return this.productModel.create(dto);
  }

  findAll(categoryId?: string): Promise<ProductDocument[]> {
    const filter = categoryId ? { categoryId } : {};
    return this.productModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  findForSeller(sellerId: string): Promise<ProductDocument[]> {
    return this.productModel.find({ sellerId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Listing not found.');
    }
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Listing not found.');
    }
    return product;
  }

  async recordView(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.productModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec();
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.findById(id);
    if (product.sellerId !== dto.actorId) {
      throw new ForbiddenException('Only the seller who created this listing can edit it.');
    }

    if (dto.title !== undefined) product.title = dto.title;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.condition !== undefined) product.condition = dto.condition;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.location !== undefined) product.location = dto.location;
    if (dto.available !== undefined) product.available = dto.available;
    if (dto.imageUrls !== undefined) product.imageUrls = dto.imageUrls;

    await product.save();
    return product;
  }

  async remove(id: string, actorId: string): Promise<void> {
    const product = await this.findById(id);
    if (product.sellerId !== actorId) {
      throw new ForbiddenException('Only the seller who created this listing can delete it.');
    }
    await this.productModel.deleteOne({ _id: product._id }).exec();
  }

  // Used by admin-categories to block deleting a category that's
  // still in use, rather than silently orphaning listings filed
  // under it.
  countByCategory(categoryId: string): Promise<number> {
    return this.productModel.countDocuments({ categoryId }).exec();
  }
}
