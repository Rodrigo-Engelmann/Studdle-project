import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Video } from './videos.entity';
import { VideoController } from './videos.controller';
import { VideoService } from './videos.service';
import { VideoStatus } from '../videostatus/videostatus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video
      , VideoStatus
    ]),
    HttpModule
  ],
  controllers: [
    VideoController
  ],
  providers: [
    VideoService
  ],
  exports: [
    VideoService
  ],
})
export class VideoModule {}