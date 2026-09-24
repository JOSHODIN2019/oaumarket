import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
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
      { name: Notification.name, schema: NotificationSchema },
    ]),
    AdminAuthModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
