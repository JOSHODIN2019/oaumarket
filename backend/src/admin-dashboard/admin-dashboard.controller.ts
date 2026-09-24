import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Controller('admin-dashboard')
@UseGuards(AdminJwtAuthGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('summary')
  getSummary() {
    return this.adminDashboardService.getSummary();
  }
}
