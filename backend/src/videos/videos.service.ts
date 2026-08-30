import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './videos.entity';
import { VideoStatus } from '../videostatus/videostatus.entity';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    @InjectRepository(VideoStatus)
    private readonly videoStatusRepo: Repository<VideoStatus>,
    private readonly httpService: HttpService,
  ) {}

  create(data: Partial<Video>) {
    const video = this.videoRepo.create(data);
    return this.videoRepo.save(video);
  }

  findAll() {
    return this.videoRepo.find();
  }

  async findById(id: number) {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException(`Vídeo #${id} não encontrado`);
    return video;
  }

  async update(id: number, data: Partial<Video>) {
    await this.findById(id);
    await this.videoRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.videoRepo.delete(id);
    return { deleted: true };
  }

  findOrdered() {
    return this.videoRepo.find({ order: { sequence: 'ASC' } });
  }

  async findComments(id: number) {
    const video = await this.videoRepo.findOne({
      where: { id },
      relations: [
        'comments'
        , 'comments.user'
      ],
    });
    if (!video)
      throw new NotFoundException(`Vídeo #${id} não encontrado`);

    return video.comments;
  }

  async markComplete(videoId: number, userId: number) {
    await this.findById(videoId);
    const existing = await this.videoStatusRepo.findOne({
      where: {
        video_id: videoId
        , user_id: userId 
      },
    });
    if (existing) {
      existing.completed = true;
      return this.videoStatusRepo.save(existing);
    }
    const status = this.videoStatusRepo.create({
      video_id: videoId
      , user_id: userId
      , completed: true
    });
    return this.videoStatusRepo.save(status);
  }

  async getStatus(videoId: number, userId: number) {
    const status = await this.videoStatusRepo.findOne({
      where: { video_id: videoId, user_id: userId },
    });
    return status ?? {
      video_id: videoId
      , user_id: userId
      , completed: false
    };
  }

  async getYoutubeData(url: string) {
    const videoId = new URL(url).searchParams.get('v');
    const response = await firstValueFrom(
      this.httpService.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            part: 'snippet',
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
        },
      ),
    );

    const snippet = response.data.items[0]?.snippet;

    return {
      title: snippet?.title,
      description: snippet?.description,
      thumbnail: snippet?.thumbnails?.maxres?.url
        ?? snippet?.thumbnails?.high?.url,
    };
  }

  async findByURL(url: string) {
    const video = await this.videoRepo.findOne({
      where: { video_url: url },
    });
    if (!video)
      throw new NotFoundException(`Vídeo #${url} não encontrado`);

    return video;
  }
}


