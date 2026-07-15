import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoStatus } from './videostatus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoStatus])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class VideoStatusModule {}