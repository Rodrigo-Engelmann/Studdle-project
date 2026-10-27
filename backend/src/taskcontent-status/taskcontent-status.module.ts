import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { User } from '../users/users.entity';

import { TaskContentStatus } from './taskcontent-status.entity';
import { TaskContentStatusService } from './taskcontent-status.service';
import { TaskContentStatusController } from './taskcontent-status.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskContentStatus]),
    HttpModule,
    TypeOrmModule.forFeature([TaskContentStatus, User]),
  ],
  controllers: [TaskContentStatusController],
  providers: [TaskContentStatusService],
  exports: [TaskContentStatusService],
})
export class TaskContentStatusModule {}
