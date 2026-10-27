import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './videos.entity';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    private readonly httpService: HttpService,
  ) {}

  create(data: Partial<Video>) {
    const video = this.videoRepo.create(data);
    return this.videoRepo.save(video);
  }

  findAll() {
    return this.videoRepo.find();
  }

  async getNextVideos(userId: number, moduleId: number) {
    return this.videoRepo
      .createQueryBuilder('v')
      .innerJoin('v.task_contents', 'tc')
      .innerJoin('tc.task', 't')
      .leftJoin(
        'taskcontent_status',
        'tcs',
        'tcs.task_content_id = tc.id AND tcs.user_id = :userId',
        { userId },
      )
      .where('t.module_id = :moduleId', { moduleId })
      .andWhere('(tcs.id IS NULL OR tcs.completed = false)')
      .distinct(true)
      .orderBy('v.sequence', 'ASC')
      .limit(4)
      .getMany();
  }

  async findByModule(userId: number, moduleId: number) {
    // 1 - todos os vídeos do módulo, ordenados pela sequência
    const videos = await this.videoRepo
      .createQueryBuilder('v')
      .innerJoin('v.task_contents', 'tc')
      .innerJoin('tc.task', 't')
      .where('t.module_id = :moduleId', { moduleId })
      .distinct(true)
      .orderBy('v.sequence', 'ASC')
      .getMany();

    if (!videos.length) return [];

    const videoIds = videos.map((v) => v.id);

    // 2 - task_id de cada vídeo (dentro do módulo)
    const taskRows = await this.videoRepo
      .createQueryBuilder('v')
      .select('v.id', 'video_id')
      .addSelect('t.id', 'task_id')
      .innerJoin('v.task_contents', 'tc')
      .innerJoin('tc.task', 't')
      .where('t.module_id = :moduleId', { moduleId })
      .andWhere('v.id IN (:...ids)', { ids: videoIds })
      .getRawMany<{ video_id: number; task_id: number }>();

    const taskIdByVideo = new Map<number, number>();
    for (const row of taskRows) {
      const videoId = Number(row.video_id);
      // se o vídeo estiver em mais de uma task, mantém a primeira encontrada
      if (!taskIdByVideo.has(videoId)) {
        taskIdByVideo.set(videoId, Number(row.task_id));
      }
    }

    // 3 - ids dos vídeos que o usuário já concluiu
    const watchedRows = await this.videoRepo
      .createQueryBuilder('v')
      .select('DISTINCT v.id', 'id')
      .innerJoin('v.task_contents', 'tc')
      .innerJoin('taskcontent_status', 'tcs', 'tcs.task_content_id = tc.id')
      .where('tcs.user_id = :userId', { userId })
      .andWhere('tcs.completed = true')
      .andWhere('v.id IN (:...ids)', { ids: videoIds })
      .getRawMany<{ id: number }>();

    const watchedIds = new Set(watchedRows.map((r) => Number(r.id)));

    // 4 - junta o resultado
    return videos.map((video) => ({
      ...video,
      task_id: taskIdByVideo.get(video.id) ?? null,
      watched: watchedIds.has(video.id),
    }));
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
      relations: ['comments', 'comments.user'],
    });
    if (!video) throw new NotFoundException(`Vídeo #${id} não encontrado`);

    return video.comments;
  }

  async getYoutubeData(url: string) {
    const videoId = new URL(url).searchParams.get('v');
    const response = await firstValueFrom(
      this.httpService.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet',
          id: videoId,
          key: process.env.YOUTUBE_API_KEY,
        },
      }),
    );

    const snippet = response.data.items[0]?.snippet;

    return {
      title: snippet?.title,
      description: snippet?.description,
      thumbnail:
        snippet?.thumbnails?.maxres?.url ?? snippet?.thumbnails?.high?.url,
    };
  }

  async findByURL(url: string) {
    const video = await this.videoRepo.findOne({
      where: { video_url: url },
    });
    if (!video) throw new NotFoundException(`Vídeo #${url} não encontrado`);

    return video;
  }
}
