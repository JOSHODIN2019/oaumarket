import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminAuditLogsService } from '../admin-audit-logs/admin-audit-logs.service.js';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';

export interface AdminActor {
  id: string;
  name: string;
}

// Write access for user suspension/reinstatement and transaction
// flagging - fully isolated from the student-facing UsersService/
// TransactionsService; only an AdminJwtAuthGuard-protected route can
// reach this at all.
@Injectable()
export class AdminModerationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    private readonly adminAuditLogsService: AdminAuditLogsService,
  ) {}

  async suspendUser(id: string, actor: AdminActor) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found.');
    user.suspended = true;
    await user.save();
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'user.suspend',
      targetId: id,
    });
    return this.serializeUser(user);
  }

  async reinstateUser(id: string, actor: AdminActor) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found.');
    user.suspended = false;
    await user.save();
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'user.reinstate',
      targetId: id,
    });
    return this.serializeUser(user);
  }

  private serializeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      username: user.username,
      matricNumber: user.matricNumber,
      suspended: user.suspended,
    };
  }

  async flagTransaction(id: string, reason: string, actor: AdminActor): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) throw new NotFoundException('Transaction not found.');
    transaction.flagged = true;
    transaction.flagReason = reason;
    await transaction.save();
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'transaction.flag',
      targetId: id,
      detail: reason,
    });
    return transaction;
  }

  async unflagTransaction(id: string, actor: AdminActor): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) throw new NotFoundException('Transaction not found.');
    transaction.flagged = false;
    transaction.flagReason = undefined;
    await transaction.save();
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'transaction.unflag',
      targetId: id,
    });
    return transaction;
  }
}
