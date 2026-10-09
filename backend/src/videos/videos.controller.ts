import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Video } from './videos.entity';
import { VideoService } from './videos.service';

@Controller('videos')
export class VideoController extends BaseController<Video> {
  constructor(private readonly videoService: VideoService) {
    super(videoService);
  }

  // Retorna vídeos ordenados pela sequência
  @Get('ordered')
  findOrdered() {
    return this.videoService.findOrdered();
  }

  @Get('findByURL/:url')
  findByURL(@Param('url') url: string) {
    return this.videoService.findByURL(url);
  }

  // Retorna os comentários de um vídeo
  @Get(':id/comments')
  findComments(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.findComments(id);
  }

  // retorna dados de api sobre o vídeo do youtube em parâmetro
  @Get('getYoutubeData')
  getYoutubeData(@Query('url') url: string) {
    return this.videoService.getYoutubeData(url);
  }
}
