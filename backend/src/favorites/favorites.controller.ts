import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { FavoritesService } from './favorites.service.js';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  add(@Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(dto);
  }

  @Delete()
  remove(@Query('userId') userId?: string, @Query('productId') productId?: string) {
    if (!userId || !productId) {
      throw new BadRequestException('userId and productId query parameters are required.');
    }
    return this.favoritesService.remove(userId, productId);
  }

  @Get(':userId')
  findForUser(@Param('userId') userId: string) {
    return this.favoritesService.findForUser(userId);
  }
}
