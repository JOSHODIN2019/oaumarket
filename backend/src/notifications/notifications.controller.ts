import { BadRequestException, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findForUser(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required.');
    }
    return this.notificationsService.findForUser(userId);
  }

  @Patch('read-all')
  markAllAsRead(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required.');
    }
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required.');
    }
    return this.notificationsService.markAsRead(id, userId);
  }
}
