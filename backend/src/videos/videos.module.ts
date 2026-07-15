import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './videos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class VideoModule {}