import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from './comments.entity';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';
import { UserNotificationModule } from '../user_notifications/user_notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UserNotificationModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
