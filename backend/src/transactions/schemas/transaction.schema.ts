import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

// A simple purchase/exchange record - no escrow, no wallet
// settlement. Tracks whether a buyer's purchase/exchange with a
// seller is still open, done, or called off.
export const TRANSACTION_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

// No real payment gateway is integrated - this only records which
// simulated method the buyer picked, for the campus-marketplace demo
// flow (see PROJECT_RULES: real payment gateways need separate
// approval).
export const PAYMENT_METHODS = ['card', 'bank_transfer', 'cash_on_pickup'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  buyerId: string;

  @Prop({ required: true })
  sellerId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({
    type: String,
    required: true,
    enum: TRANSACTION_STATUSES,
    default: 'pending',
  })
  status: TransactionStatus;

  @Prop({ default: false })
  flagged: boolean;

  @Prop()
  flagReason?: string;

  @Prop({ type: String, required: true, enum: PAYMENT_METHODS })
  paymentMethod: PaymentMethod;

  // Server-generated, never trusted from the client - a fake
  // reference number so the simulated "receipt" looks real without
  // any actual payment processor involved.
  @Prop({ required: true })
  paymentReference: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ sellerId: 1 });
TransactionSchema.index({ status: 1 });
