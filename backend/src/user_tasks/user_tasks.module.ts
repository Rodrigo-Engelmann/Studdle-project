import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { UserTask } from './user_tasks.entity';
import { UserTaskController } from './user_tasks.controller';
import { UserTaskService } from './user_tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask]), HttpModule],
  controllers: [UserTaskController],
  providers: [UserTaskService],
  exports: [UserTaskService],
})
export class UserTaskModule {}
