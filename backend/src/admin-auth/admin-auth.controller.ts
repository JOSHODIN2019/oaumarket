import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { SeedAdminDto } from './dto/seed-admin.dto.js';
import { CurrentAdmin } from './decorators/current-admin.decorator.js';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard.js';
import type { AuthenticatedAdmin } from './strategies/admin-jwt.strategy.js';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @Post('seed-dev-admin')
  seedDevAdmin(@Body() dto: SeedAdminDto) {
    return this.adminAuthService.seedDevAdmin(dto);
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard)
  me(@CurrentAdmin() admin: AuthenticatedAdmin) {
    return admin;
  }
}
