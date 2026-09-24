import { IsString, MinLength } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @MinLength(1)
  userId: string;

  @IsString()
  @MinLength(1)
  productId: string;
}
