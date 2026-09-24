import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminAuditLogsService } from '../admin-audit-logs/admin-audit-logs.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { Report, ReportDocument } from './schemas/report.schema.js';

export interface AdminActor {
  id: string;
  name: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly adminAuditLogsService: AdminAuditLogsService,
  ) {}

  create(dto: CreateReportDto): Promise<ReportDocument> {
    return this.reportModel.create(dto);
  }

  findAll(): Promise<ReportDocument[]> {
    return this.reportModel.find().sort({ createdAt: -1 }).exec();
  }

  async resolve(id: string, actor: AdminActor): Promise<ReportDocument> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException('Report not found.');
    }
    report.resolved = true;
    await report.save();
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'report.resolve',
      targetId: id,
    });
    return report;
  }
}
