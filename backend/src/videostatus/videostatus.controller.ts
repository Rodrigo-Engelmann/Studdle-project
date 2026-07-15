import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { VideoStatusService } from './videostatus.service';

// Não estende BaseController pois usa PK composta (user_id + video_id)
@Controller('video-status')
export class VideoStatusController {
  constructor(private readonly videoStatusService: VideoStatusService) {}

  // Cria ou atualiza o status de um vídeo para um usuário
  @Post()
  upsert(
    @Body() data: { user_id: number; video_id: number; completed: boolean },
  ) {
    return this.videoStatusService.upsert(data);
  }

  // Retorna o status de todos os vídeos de um usuário
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.videoStatusService.findByUser(userId);
  }

  // Retorna quantos usuários concluíram um vídeo
  @Get('video/:videoId/completions')
  findCompletionsByVideo(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.videoStatusService.findCompletionsByVideo(videoId);
  }

  // Retorna o status de um vídeo específico para um usuário específico
  @Get('user/:userId/video/:videoId')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('videoId', ParseIntPipe) videoId: number,
  ) {
    return this.videoStatusService.findOne(userId, videoId);
  }
}