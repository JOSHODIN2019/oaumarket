import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { MessagesService } from './messages.service.js';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(@Body() dto: CreateMessageDto) {
    return this.messagesService.send(dto);
  }

  @Get('conversation')
  findConversation(
    @Query('productId') productId?: string,
    @Query('buyerId') buyerId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('viewerId') viewerId?: string,
  ) {
    if (!productId || !buyerId || !sellerId) {
      throw new BadRequestException('productId, buyerId, and sellerId query parameters are required.');
    }
    return this.messagesService.findConversation(productId, buyerId, sellerId, viewerId);
  }

  @Get('inbox')
  findInbox(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required.');
    }
    return this.messagesService.findInbox(userId);
  }
}
