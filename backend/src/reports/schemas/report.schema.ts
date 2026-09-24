import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report> & { createdAt: Date };

export const REPORT_TARGET_TYPES = ['user', 'product'] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true })
  reporterId: string;

  @Prop({ type: String, required: true, enum: REPORT_TARGET_TYPES })
  targetType: ReportTargetType;

  @Prop({ required: true })
  targetId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: false })
  resolved: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
