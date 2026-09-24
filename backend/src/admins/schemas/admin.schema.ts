import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;

// Fully isolated from student accounts (`User`) - separate
// collection, separate JWT secret (see admin-auth), so a regular
// user's token can never be valid for an admin route even in
// principle.
@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
