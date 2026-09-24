import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard.js';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator.js';
import type { AuthenticatedAdmin } from '../admin-auth/strategies/admin-jwt.strategy.js';
import { AdminModerationService } from './admin-moderation.service.js';
import { FlagTransactionDto } from './dto/flag-transaction.dto.js';

@Controller('admin-moderation')
@UseGuards(AdminJwtAuthGuard)
export class AdminModerationController {
  constructor(private readonly adminModerationService: AdminModerationService) {}

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.adminModerationService.suspendUser(id, admin);
  }

  @Patch('users/:id/reinstate')
  reinstateUser(@Param('id') id: string, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.adminModerationService.reinstateUser(id, admin);
  }

  @Patch('transactions/:id/flag')
  flagTransaction(
    @Param('id') id: string,
    @Body() dto: FlagTransactionDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.adminModerationService.flagTransaction(id, dto.reason, admin);
  }

  @Patch('transactions/:id/unflag')
  unflagTransaction(@Param('id') id: string, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.adminModerationService.unflagTransaction(id, admin);
  }
}
