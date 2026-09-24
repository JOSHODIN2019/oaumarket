import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AdminAuditLogsModule } from './admin-audit-logs/admin-audit-logs.module.js';
import { AdminAuthModule } from './admin-auth/admin-auth.module.js';
import { AdminCategoriesModule } from './admin-categories/admin-categories.module.js';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module.js';
import { AdminModerationModule } from './admin-moderation/admin-moderation.module.js';
import { AdminTransactionsModule } from './admin-transactions/admin-transactions.module.js';
import { AdminsModule } from './admins/admins.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { OffersModule } from './offers/offers.module.js';
import { ProductsModule } from './products/products.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    MessagesModule,
    TransactionsModule,
    OffersModule,
    FavoritesModule,
    NotificationsModule,
    ReportsModule,
    AdminsModule,
    AdminAuthModule,
    AdminDashboardModule,
    AdminModerationModule,
    AdminTransactionsModule,
    AdminCategoriesModule,
    AdminAuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
