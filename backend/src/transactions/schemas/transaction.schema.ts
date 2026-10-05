import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

// A simple exchange record - no escrow, no wallet settlement, no
// payment processing of any kind. Every exchange on the platform
// happens in person, on campus: price is agreed over chat or an
// offer, then the two students pick a meetup point to hand the item
// over. This record tracks whether that handoff is still pending,
// done, or called off.
export const TRANSACTION_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

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

  // A public, well-known spot on campus - e.g. "Oduduwa Hall" or
  // "Awolowo Hall Gate" - where the buyer and seller agreed to meet
  // and hand over the item.
  @Prop({ required: true })
  meetupLocation: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ sellerId: 1 });
TransactionSchema.index({ status: 1 });
