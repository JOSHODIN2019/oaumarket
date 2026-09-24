import { IsIn, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { PAYMENT_METHODS } from '../schemas/transaction.schema.js';
import type { PaymentMethod } from '../schemas/transaction.schema.js';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsIn(PAYMENT_METHODS)
  paymentMethod: PaymentMethod;
}
