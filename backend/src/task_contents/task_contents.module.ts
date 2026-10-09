import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskContent } from './task_contents.entity';
import { TaskContentService } from './task_contents.service';
import { TaskContentController } from './task_contents.controller';
import { TaskContentStatusModule } from '../taskcontent-status/taskcontent-status.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskContent]), TaskContentStatusModule],
  controllers: [TaskContentController],
  providers: [TaskContentService],
  exports: [TypeOrmModule, TaskContentService],
})
export class TaskContentModule {}
