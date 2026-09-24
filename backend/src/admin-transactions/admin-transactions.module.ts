import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { AdminTransactionsController } from './admin-transactions.controller.js';
import { AdminTransactionsService } from './admin-transactions.service.js';

@Module({
  imports: [TransactionsModule, AdminAuthModule],
  controllers: [AdminTransactionsController],
  providers: [AdminTransactionsService],
})
export class AdminTransactionsModule {}
