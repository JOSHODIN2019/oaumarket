import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, ValidateIf } from 'class-validator';
import { OFFER_TYPES } from '../schemas/offer.schema.js';
import type { OfferType } from '../schemas/offer.schema.js';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsOptional()
  @IsIn(OFFER_TYPES)
  offerType: OfferType = 'cash';

  @ValidateIf((dto: CreateOfferDto) => dto.offerType === 'cash')
  @IsNumber()
  @IsPositive()
  offerAmount?: number;

  @ValidateIf((dto: CreateOfferDto) => dto.offerType === 'barter')
  @IsString()
  @IsNotEmpty()
  offeredProductId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
