import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FlagTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
