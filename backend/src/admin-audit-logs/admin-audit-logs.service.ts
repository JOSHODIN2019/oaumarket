import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminAuditLog, AdminAuditLogDocument, AdminAuditAction } from './schemas/admin-audit-log.schema.js';

export interface RecordAuditEntry {
  adminId: string;
  adminName: string;
  action: AdminAuditAction;
  targetId: string;
  detail?: string;
}

@Injectable()
export class AdminAuditLogsService {
  constructor(
    @InjectModel(AdminAuditLog.name)
    private readonly adminAuditLogModel: Model<AdminAuditLogDocument>,
  ) {}

  record(entry: RecordAuditEntry): Promise<AdminAuditLogDocument> {
    return this.adminAuditLogModel.create(entry);
  }

  findAll(limit = 100): Promise<AdminAuditLogDocument[]> {
    return this.adminAuditLogModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}
