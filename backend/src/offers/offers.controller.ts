import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { RespondOfferDto } from './dto/respond-offer.dto.js';
import { OffersService } from './offers.service.js';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Get()
  findForUser(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required.');
    }
    return this.offersService.findForUser(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Body() dto: RespondOfferDto) {
    return this.offersService.accept(id, dto.actorId);
  }

  @Patch(':id/decline')
  decline(@Param('id') id: string, @Body() dto: RespondOfferDto) {
    return this.offersService.decline(id, dto.actorId);
  }

  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @Body() dto: RespondOfferDto) {
    return this.offersService.withdraw(id, dto.actorId);
  }
}
