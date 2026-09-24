import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuditLogsModule } from '../admin-audit-logs/admin-audit-logs.module.js';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { AdminModerationController } from './admin-moderation.controller.js';
import { AdminModerationService } from './admin-moderation.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    AdminAuthModule,
    AdminAuditLogsModule,
  ],
  controllers: [AdminModerationController],
  providers: [AdminModerationService],
})
export class AdminModerationModule {}
