import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuditLogsModule } from '../admin-audit-logs/admin-audit-logs.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { Report, ReportSchema } from './schemas/report.schema.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    AdminAuditLogsModule,
    AdminAuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
