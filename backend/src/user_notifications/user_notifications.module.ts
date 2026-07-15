import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './user_notifications.entity';
 
@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class UserNotificationModule {}
 