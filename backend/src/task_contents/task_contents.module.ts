import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskContent } from './task_contents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskContent])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class TaskContentModule {}