import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { Report, ReportSchema } from '../reports/schemas/report.schema.js';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    AdminAuthModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
