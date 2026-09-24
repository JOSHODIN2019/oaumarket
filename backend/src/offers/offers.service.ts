import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ProductsService } from '../products/products.service.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { Offer, OfferDocument } from './schemas/offer.schema.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    private readonly transactionsService: TransactionsService,
    private readonly notificationsService: NotificationsService,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateOfferDto): Promise<OfferDocument> {
    if (dto.buyerId === dto.sellerId) {
      throw new BadRequestException('A buyer cannot make an offer to themselves.');
    }

    let notificationMessage = `You received a new offer of ₦${dto.offerAmount} for your listing.`;

    if (dto.offerType === 'barter') {
      const offeredProduct = await this.productsService.findById(dto.offeredProductId as string);
      if (offeredProduct.sellerId !== dto.buyerId) {
        throw new BadRequestException('You can only offer one of your own listings in a trade.');
      }
      if (!offeredProduct.available) {
        throw new BadRequestException('That listing is no longer available to trade.');
      }
      if (offeredProduct._id.toString() === dto.productId) {
        throw new BadRequestException('You cannot trade a listing for itself.');
      }
      notificationMessage = `You received a trade offer: "${offeredProduct.title}" for your listing.`;
    }

    const offer = await this.offerModel.create(dto);
    await this.notificationsService.create({
      userId: dto.sellerId,
      type: 'offer_received',
      message: notificationMessage,
    });
    return offer;
  }

  async findById(id: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Offer not found.');
    }
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException('Offer not found.');
    }
    return offer;
  }

  findForUser(userId: string): Promise<OfferDocument[]> {
    return this.offerModel
      .find({ $or: [{ buyerId: userId }, { sellerId: userId }] })
      .sort({ createdAt: -1 })
      .exec();
  }

  async accept(id: string, actorId: string): Promise<OfferDocument> {
    const offer = await this.findById(id);
    if (offer.sellerId !== actorId) {
      throw new ForbiddenException('Only the seller can accept an offer.');
    }
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Offer is already ${offer.status}.`);
    }

    if (offer.offerType === 'barter') {
      // A trade has no money changing hands, so there's no Transaction
      // to create - the offer record itself is the agreement, and
      // either side marks their own listing sold/unavailable once the
      // physical swap has happened.
      offer.status = 'accepted';
      await offer.save();
      await this.notificationsService.create({
        userId: offer.buyerId,
        type: 'offer_accepted',
        message: 'Your trade offer was accepted!',
      });
      return offer;
    }

    // An accepted cash offer was negotiated over messaging, not
    // through the Buy Now payment step, so there's no method the
    // buyer picked - cash-on-pickup is the reasonable default for an
    // in-person deal.
    const transaction = await this.transactionsService.create({
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      productId: offer.productId,
      amount: offer.offerAmount as number,
      paymentMethod: 'cash_on_pickup',
    });
    offer.status = 'accepted';
    offer.transactionId = transaction._id.toString();
    await offer.save();
    await this.notificationsService.create({
      userId: offer.buyerId,
      type: 'offer_accepted',
      transactionId: offer.transactionId,
      message: 'Your offer was accepted - a transaction has been created.',
    });
    return offer;
  }

  async decline(id: string, actorId: string): Promise<OfferDocument> {
    const offer = await this.findById(id);
    if (offer.sellerId !== actorId) {
      throw new ForbiddenException('Only the seller can decline an offer.');
    }
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Offer is already ${offer.status}.`);
    }
    offer.status = 'declined';
    await offer.save();
    await this.notificationsService.create({
      userId: offer.buyerId,
      type: 'offer_declined',
      message: 'Your offer was declined.',
    });
    return offer;
  }

  async withdraw(id: string, actorId: string): Promise<OfferDocument> {
    const offer = await this.findById(id);
    if (offer.buyerId !== actorId) {
      throw new ForbiddenException('Only the buyer can withdraw an offer.');
    }
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Offer is already ${offer.status}.`);
    }
    offer.status = 'withdrawn';
    await offer.save();
    return offer;
  }
}
