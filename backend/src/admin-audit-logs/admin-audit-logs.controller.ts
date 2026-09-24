import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard.js';
import { AdminAuditLogsService } from './admin-audit-logs.service.js';

@Controller('admin-audit-logs')
@UseGuards(AdminJwtAuthGuard)
export class AdminAuditLogsController {
  constructor(private readonly adminAuditLogsService: AdminAuditLogsService) {}

  @Get()
  findAll() {
    return this.adminAuditLogsService.findAll();
  }
}
