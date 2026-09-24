import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard.js';
import { AdminTransactionsService } from './admin-transactions.service.js';

@Controller('admin-transactions')
@UseGuards(AdminJwtAuthGuard)
export class AdminTransactionsController {
  constructor(private readonly adminTransactionsService: AdminTransactionsService) {}

  @Get()
  findRecent() {
    return this.adminTransactionsService.findRecent();
  }

  @Get(':id')
  investigate(@Param('id') id: string) {
    return this.adminTransactionsService.investigate(id);
  }
}
