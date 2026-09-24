import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard.js';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator.js';
import type { AuthenticatedAdmin } from '../admin-auth/strategies/admin-jwt.strategy.js';
import { CreateCategoryDto } from '../categories/dto/create-category.dto.js';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto.js';
import { AdminCategoriesService } from './admin-categories.service.js';

@Controller('admin-categories')
@UseGuards(AdminJwtAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.adminCategoriesService.create(dto, admin);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.adminCategoriesService.update(id, dto, admin);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.adminCategoriesService.remove(id, admin);
  }
}
