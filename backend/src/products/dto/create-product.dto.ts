import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { PRODUCT_CONDITIONS } from '../schemas/product.schema.js';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsIn(PRODUCT_CONDITIONS)
  condition: (typeof PRODUCT_CONDITIONS)[number];

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
