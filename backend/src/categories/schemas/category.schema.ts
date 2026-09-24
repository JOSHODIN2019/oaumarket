import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  // URL/filter-friendly identifier - what Product.categoryId actually
  // stores, so renaming a category's display `name` later doesn't
  // silently detach it from every listing already filed under it.
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
