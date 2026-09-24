import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PRODUCT_CONDITIONS } from '../schemas/product.schema.js';

// Every field the seller can change is optional; `actorId` is
// required on every request and isn't a field of the listing itself,
// just proof of who's asking, checked against `Product.sellerId`
// before anything is applied.
export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  actorId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsIn(PRODUCT_CONDITIONS)
  condition?: (typeof PRODUCT_CONDITIONS)[number];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
