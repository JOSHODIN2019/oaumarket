import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  // Format DEPT/YEAR/NUMBER (e.g. CSC/2019/093) - the student's real
  // institutional identifier, used to log in instead of an email.
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  matricNumber: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  suspended: boolean;

  // A base64 data URL, same pattern product photos use - no external
  // file storage exists yet.
  @Prop()
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
