import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTask } from './user_tasks.entity';
 
@Module({
  imports: [TypeOrmModule.forFeature([UserTask])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class UserTaskModule {}
 