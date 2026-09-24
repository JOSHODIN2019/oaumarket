import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product> & { createdAt: Date };

export const PRODUCT_CONDITIONS = ['New', 'Used'] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: String, required: true, enum: PRODUCT_CONDITIONS })
  condition: ProductCondition;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  location: string;

  // A real User's Mongo id - this project has real accounts from the
  // start (unlike an anonymous-id convention), so listings are always
  // tied to a real seller.
  @Prop({ required: true })
  sellerId: string;

  @Prop({ default: true })
  available: boolean;

  // The seller's own photos, client-resized to data URLs before they
  // reach this API. Falls back to a placeholder gradient on the
  // frontend when empty.
  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: 0 })
  viewCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ sellerId: 1 });
