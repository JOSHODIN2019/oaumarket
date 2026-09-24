import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { ProductsModule } from '../products/products.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { Offer, OfferSchema } from './schemas/offer.schema.js';
import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
    TransactionsModule,
    NotificationsModule,
    ProductsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
