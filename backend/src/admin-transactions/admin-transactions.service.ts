import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service.js';
import { TransactionDocument } from '../transactions/schemas/transaction.schema.js';

@Injectable()
export class AdminTransactionsService {
  constructor(private readonly transactionsService: TransactionsService) {}

  async findRecent() {
    const transactions = await this.transactionsService.findRecent();
    return transactions.map((transaction) => this.serializeTransaction(transaction));
  }

  async investigate(transactionId: string) {
    const transaction = await this.transactionsService.findById(transactionId);
    return this.serializeTransaction(transaction);
  }

  private serializeTransaction(transaction: TransactionDocument) {
    return {
      id: transaction._id.toString(),
      buyerId: transaction.buyerId,
      sellerId: transaction.sellerId,
      productId: transaction.productId,
      amount: transaction.amount,
      status: transaction.status,
      flagged: transaction.flagged,
      flagReason: transaction.flagReason,
      paymentMethod: transaction.paymentMethod,
      paymentReference: transaction.paymentReference,
      createdAt: (transaction as unknown as { createdAt: Date }).createdAt,
    };
  }
}
