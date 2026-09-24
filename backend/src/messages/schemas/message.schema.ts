import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message> & { createdAt: Date };

// One row per chat message. A "conversation" isn't its own document -
// it's just every message sharing the same (productId, buyerId,
// sellerId) triple, resolved on read rather than a separate thread
// entity to keep in sync.
@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productTitle: string;

  @Prop({ required: true })
  buyerId: string;

  @Prop({ required: true })
  buyerName: string;

  @Prop({ required: true })
  sellerId: string;

  @Prop({ required: true })
  sellerName: string;

  // Whoever actually sent this message - must be buyerId or sellerId.
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ productId: 1, buyerId: 1, sellerId: 1 });
MessageSchema.index({ buyerId: 1 });
MessageSchema.index({ sellerId: 1 });
