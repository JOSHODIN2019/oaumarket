import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard.js';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator.js';
import type { AuthenticatedAdmin } from '../admin-auth/strategies/admin-jwt.strategy.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { ReportsService } from './reports.service.js';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto);
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  findAll() {
    return this.reportsService.findAll();
  }

  @Patch(':id/resolve')
  @UseGuards(AdminJwtAuthGuard)
  resolve(@Param('id') id: string, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.reportsService.resolve(id, admin);
  }
}
