import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Video } from './videos.entity';
import { VideoService } from './videos.service';
import { UserService } from '../users/users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('videos')
export class VideoController extends BaseController<Video> {
  constructor(
    private readonly videoService: VideoService,
    private readonly userService: UserService,
  ) {
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

  // GET /videos/next
  @UseGuards(JwtAuthGuard)
  @Get('next')
  async getNextVideos(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);

    if (!user.current_module_id) {
      return [];
    }

    return this.videoService.getNextVideos(userId, user.current_module_id);
  }

  // GET /videos/module/:moduleId
  @UseGuards(JwtAuthGuard)
  @Get('module/:moduleId')
  findByModule(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.videoService.findByModule(req.user.id, moduleId);
  }
}
