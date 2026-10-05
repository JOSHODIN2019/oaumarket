import { IsOptional, IsString, MaxLength } from 'class-validator';
import { RespondOfferDto } from './respond-offer.dto.js';

// Required only for a cash offer (the seller picks where to meet to
// hand the item over and collect payment); a barter offer has no
// transaction, so it's simply ignored there.
export class AcceptOfferDto extends RespondOfferDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  meetupLocation?: string;
}
