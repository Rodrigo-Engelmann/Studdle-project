import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserNotification } from './user_notifications.entity';
import { UserNotificationService } from './user_notifications.service';
import { UserNotificationController } from './user_notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
  controllers: [UserNotificationController],
  providers: [UserNotificationService],
  exports: [UserNotificationService, TypeOrmModule],
})
export class UserNotificationModule {}
