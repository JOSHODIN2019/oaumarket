import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer> & { createdAt: Date };

export const OFFER_STATUSES = ['pending', 'accepted', 'declined', 'withdrawn'] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

// 'cash' proposes a different price; 'barter' proposes one of the
// buyer's own listings in exchange, with no money involved.
export const OFFER_TYPES = ['cash', 'barter'] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

// An alternative to instant "Buy Now" - a buyer proposes a price (or
// a trade) instead of paying the listed one, the seller accepts or
// declines. Accepting a cash offer creates a real Transaction at the
// agreed `offerAmount`; a barter offer has no transaction - it's not
// a monetary exchange, just an agreed swap between the two listings.
@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  buyerId: string;

  @Prop({ required: true })
  sellerId: string;

  @Prop({ type: String, required: true, enum: OFFER_TYPES, default: 'cash' })
  offerType: OfferType;

  // Required for 'cash' offers, absent for 'barter' ones.
  @Prop({ min: 0 })
  offerAmount?: number;

  // Required for 'barter' offers - one of the buyer's own listings,
  // proposed in exchange for `productId`.
  @Prop()
  offeredProductId?: string;

  @Prop()
  message?: string;

  @Prop({ type: String, required: true, enum: OFFER_STATUSES, default: 'pending' })
  status: OfferStatus;

  @Prop()
  transactionId?: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

OfferSchema.index({ buyerId: 1 });
OfferSchema.index({ sellerId: 1 });
