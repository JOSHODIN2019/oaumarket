import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { AdminAuditLog, AdminAuditLogSchema } from './schemas/admin-audit-log.schema.js';
import { AdminAuditLogsController } from './admin-audit-logs.controller.js';
import { AdminAuditLogsService } from './admin-audit-logs.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdminAuditLog.name, schema: AdminAuditLogSchema }]),
    AdminAuthModule,
  ],
  controllers: [AdminAuditLogsController],
  providers: [AdminAuditLogsService],
  exports: [AdminAuditLogsService],
})
export class AdminAuditLogsModule {}
