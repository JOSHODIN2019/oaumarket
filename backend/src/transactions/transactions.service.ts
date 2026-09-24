import { randomBytes } from 'crypto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { Transaction, TransactionDocument } from './schemas/transaction.schema.js';

// A fake reference for the simulated payment "receipt" - never a real
// gateway transaction id, just enough to look like one in the demo UI.
function generatePaymentReference(): string {
  return `SIM-${randomBytes(5).toString('hex').toUpperCase()}`;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<TransactionDocument> {
    if (dto.buyerId === dto.sellerId) {
      throw new BadRequestException('A buyer cannot transact with themselves.');
    }
    return this.transactionModel.create({
      buyerId: dto.buyerId,
      sellerId: dto.sellerId,
      productId: dto.productId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      paymentReference: generatePaymentReference(),
    });
  }

  // Either the buyer or the seller can mark their own transaction
  // completed (item handed over) or cancelled - no dual approval, no
  // escrow: this is a plain marketplace record, not a payment-holding
  // mechanism.
  async updateStatus(id: string, status: 'completed' | 'cancelled', actorId: string): Promise<TransactionDocument> {
    const transaction = await this.findById(id);
    if (transaction.buyerId !== actorId && transaction.sellerId !== actorId) {
      throw new ForbiddenException('Only the buyer or seller on this transaction can update it.');
    }
    if (transaction.status !== 'pending') {
      throw new BadRequestException(`Transaction is already ${transaction.status}.`);
    }
    transaction.status = status;
    await transaction.save();

    const otherPartyId = actorId === transaction.buyerId ? transaction.sellerId : transaction.buyerId;
    await this.notificationsService.create({
      userId: otherPartyId,
      type: status === 'completed' ? 'transaction_completed' : 'transaction_cancelled',
      transactionId: transaction._id.toString(),
      message: status === 'completed' ? 'Your transaction was marked completed.' : 'Your transaction was cancelled.',
    });

    return transaction;
  }

  async findById(id: string): Promise<TransactionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Transaction not found.');
    }
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }
    return transaction;
  }

  findForUser(userId: string): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find({ $or: [{ buyerId: userId }, { sellerId: userId }] })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Admin-only: every transaction, newest first.
  findRecent(limit = 50): Promise<TransactionDocument[]> {
    return this.transactionModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}
