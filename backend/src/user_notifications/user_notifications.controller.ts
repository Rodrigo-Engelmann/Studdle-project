import { Controller, Get, Patch, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { UserNotification } from './user_notifications.entity';
import { UserNotificationService } from './user_notifications.service';

@Controller('user-notifications')
export class UserNotificationController extends BaseController<UserNotification> {
  constructor(private readonly notificationService: UserNotificationService) {
    super(notificationService);
  }

  // Retorna todas as notificações de um usuário
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.findByUser(userId);
  }

  // Retorna somente as notificações não lidas de um usuário
  @Get('user/:userId/unread')
  findUnread(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.findUnread(userId);
  }

  // Marca uma notificação como lida
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(id);
  }

  // Marca todas as notificações de um usuário como lidas
  @Patch('user/:userId/read-all')
  markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }

  // Remove todas as notificações lidas de um usuário
  @Delete('user/:userId/read')
  clearRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.clearRead(userId);
  }
}