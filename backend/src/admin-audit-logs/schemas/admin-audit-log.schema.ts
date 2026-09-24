import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminAuditLogDocument = HydratedDocument<AdminAuditLog> & { createdAt: Date };

// Records what an *admin* did (suspend/reinstate/flag/unflag/resolve
// actions), for accountability over privileged actions. No update()/
// delete() anywhere in the service - immutable by design.
export const ADMIN_AUDIT_ACTIONS = [
  'user.suspend',
  'user.reinstate',
  'transaction.flag',
  'transaction.unflag',
  'report.resolve',
  'category.create',
  'category.update',
  'category.delete',
] as const;
export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];

@Schema({ timestamps: true })
export class AdminAuditLog {
  @Prop({ required: true })
  adminId: string;

  @Prop({ required: true })
  adminName: string;

  @Prop({ type: String, required: true, enum: ADMIN_AUDIT_ACTIONS })
  action: AdminAuditAction;

  @Prop({ required: true })
  targetId: string;

  @Prop()
  detail?: string;
}

export const AdminAuditLogSchema = SchemaFactory.createForClass(AdminAuditLog);
