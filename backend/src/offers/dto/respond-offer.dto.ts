import { IsNotEmpty, IsString } from 'class-validator';

export class RespondOfferDto {
  @IsString()
  @IsNotEmpty()
  actorId: string;
}
