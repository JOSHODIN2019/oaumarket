import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../notifications/schemas/notification.schema.js';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';

const RECENT_LIMIT = 20;

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async getSummary() {
    const [
      userCount,
      recentUsers,
      productCount,
      transactionCount,
      recentTransactions,
      flaggedCount,
      recentFlagged,
      notificationCount,
      unreadNotificationCount,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel
        .find()
        .select({ fullName: 1, username: 1, matricNumber: 1, suspended: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .exec(),
      this.productModel.countDocuments().exec(),
      this.transactionModel.countDocuments().exec(),
      this.transactionModel.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).exec(),
      this.transactionModel.countDocuments({ flagged: true }).exec(),
      this.transactionModel.find({ flagged: true }).sort({ createdAt: -1 }).limit(RECENT_LIMIT).exec(),
      this.notificationModel.countDocuments().exec(),
      this.notificationModel.countDocuments({ read: false }).exec(),
    ]);

    const involvedUserIds = new Set<string>();
    for (const transaction of [...recentTransactions, ...recentFlagged]) {
      involvedUserIds.add(transaction.buyerId);
      involvedUserIds.add(transaction.sellerId);
    }
    const validInvolvedUserIds = Array.from(involvedUserIds).filter((id) => Types.ObjectId.isValid(id));
    const involvedUsers = await this.userModel.find({ _id: { $in: validInvolvedUserIds } }).select({ fullName: 1 }).exec();
    const userNamesById = new Map(involvedUsers.map((user) => [user._id.toString(), user.fullName]));

    return {
      users: {
        count: userCount,
        recent: recentUsers.map((user) => ({
          id: user._id.toString(),
          fullName: user.fullName,
          username: user.username,
          matricNumber: user.matricNumber,
          suspended: user.suspended,
          createdAt: (user as unknown as { createdAt: Date }).createdAt,
        })),
      },
      products: { count: productCount },
      transactions: {
        count: transactionCount,
        recent: recentTransactions.map((transaction) => this.serializeTransaction(transaction, userNamesById)),
      },
      flaggedTransactions: {
        count: flaggedCount,
        recent: recentFlagged.map((transaction) => this.serializeTransaction(transaction, userNamesById)),
      },
      notifications: {
        count: notificationCount,
        unreadCount: unreadNotificationCount,
      },
    };
  }

  private serializeTransaction(transaction: TransactionDocument, userNamesById: Map<string, string>) {
    return {
      id: transaction._id.toString(),
      buyerId: transaction.buyerId,
      buyerName: userNamesById.get(transaction.buyerId) ?? 'Unknown user',
      sellerId: transaction.sellerId,
      sellerName: userNamesById.get(transaction.sellerId) ?? 'Unknown user',
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
