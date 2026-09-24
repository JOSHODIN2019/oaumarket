import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export const NOTIFICATION_TYPES = [
  'new_message',
  'transaction_completed',
  'transaction_cancelled',
  'offer_received',
  'offer_accepted',
  'offer_declined',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// "Secure" (private per-recipient) - every read is scoped to a single
// `userId`; nothing here ever lists notifications across users.
@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, required: true, enum: NOTIFICATION_TYPES })
  type: NotificationType;

  @Prop()
  transactionId?: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1 });
