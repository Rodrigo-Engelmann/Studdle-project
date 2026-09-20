import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Task } from './tasks.entity';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task
    ]),
    HttpModule
  ],
  controllers: [
    TaskController
  ],
  providers: [
    TaskService
  ],
  exports: [
    TaskService
  ],
})
export class TaskModule {}