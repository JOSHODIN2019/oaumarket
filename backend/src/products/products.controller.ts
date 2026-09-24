import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll(@Query('sellerId') sellerId?: string, @Query('categoryId') categoryId?: string) {
    return sellerId ? this.productsService.findForSeller(sellerId) : this.productsService.findAll(categoryId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    await this.productsService.recordView(id);
    return product;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('actorId') actorId?: string) {
    if (!actorId) {
      throw new BadRequestException('actorId query parameter is required.');
    }
    return this.productsService.remove(id, actorId);
  }
}
