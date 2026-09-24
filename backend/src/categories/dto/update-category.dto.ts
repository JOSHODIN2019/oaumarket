import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Slug is deliberately not editable - it's already stored on every
// listing filed under this category (`Product.categoryId`); letting
// it change would silently orphan them.
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;
}
