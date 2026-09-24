import { Module } from '@nestjs/common';
import { AdminAuditLogsModule } from '../admin-audit-logs/admin-audit-logs.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsModule } from '../products/products.module.js';
import { AdminCategoriesController } from './admin-categories.controller.js';
import { AdminCategoriesService } from './admin-categories.service.js';

@Module({
  imports: [CategoriesModule, ProductsModule, AdminAuditLogsModule, AdminAuthModule],
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
