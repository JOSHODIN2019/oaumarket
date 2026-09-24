import { IsIn, IsNotEmpty, IsString } from 'class-validator';

// 'pending' is only ever the creation default - a transaction is
// never transitioned back into it.
export class UpdateTransactionStatusDto {
  @IsIn(['completed', 'cancelled'])
  status: 'completed' | 'cancelled';

  @IsString()
  @IsNotEmpty()
  actorId: string;
}
