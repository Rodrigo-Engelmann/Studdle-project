import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Video } from './videos.entity';
import { VideoController } from './videos.controller';
import { VideoService } from './videos.service';

import { UserModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), HttpModule, UserModule],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
