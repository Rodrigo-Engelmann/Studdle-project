import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoStatus } from './videostatus.entity';

@Injectable()
export class VideoStatusService {
  constructor(
    @InjectRepository(VideoStatus)
    private readonly videoStatusRepo: Repository<VideoStatus>,
  ) {}

  async upsert(data: { user_id: number; video_id: number; completed: boolean }) {
    const existing = await this.videoStatusRepo.findOne({
      where: { user_id: data.user_id, video_id: data.video_id },
    });
    if (existing) {
      existing.completed = data.completed;
      return this.videoStatusRepo.save(existing);
    }
    const status = this.videoStatusRepo.create(data);
    return this.videoStatusRepo.save(status);
  }

  findByUser(userId: number) {
    return this.videoStatusRepo.find({
      where: { user_id: userId },
      relations: ['video'],
    });
  }

  async findCompletionsByVideo(videoId: number) {
    const total = await this.videoStatusRepo.count({ where: { video_id: videoId } });
    const completed = await this.videoStatusRepo.count({
      where: { video_id: videoId, completed: true },
    });
    return { video_id: videoId, total, completed };
  }

  async findOne(userId: number, videoId: number) {
    const status = await this.videoStatusRepo.findOne({
      where: { user_id: userId, video_id: videoId },
      relations: ['video'],
    });
    if (!status)
      throw new NotFoundException(
        `Status do vídeo #${videoId} para o usuário #${userId} não encontrado`,
      );
    return status;
  }
}