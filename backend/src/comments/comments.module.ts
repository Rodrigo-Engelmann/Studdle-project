import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class CommentModule {}