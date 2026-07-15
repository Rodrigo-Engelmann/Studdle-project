import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskContent } from './task_contents.entity';

@Injectable()
export class TaskContentService {
  constructor(
    @InjectRepository(TaskContent)
    private readonly taskContentRepo: Repository<TaskContent>,
  ) {}

  create(data: Partial<TaskContent>) {
    const taskContent = this.taskContentRepo.create(data);
    return this.taskContentRepo.save(taskContent);
  }

  findAll() {
    return this.taskContentRepo.find({ relations: ['task', 'video', 'material'] });
  }

  async findById(id: number) {
    const taskContent = await this.taskContentRepo.findOne({
      where: { id },
      relations: ['task', 'video', 'material'],
    });
    if (!taskContent) throw new NotFoundException(`TaskContent #${id} não encontrado`);
    return taskContent;
  }

  async update(id: number, data: Partial<TaskContent>) {
    await this.findById(id);
    await this.taskContentRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.taskContentRepo.delete(id);
    return { deleted: true };
  }

  findByTask(taskId: number) {
    return this.taskContentRepo.find({
      where: { task_id: taskId },
      relations: ['video', 'material'],
    });
  }

  findByVideo(videoId: number) {
    return this.taskContentRepo.find({
      where: { video_id: videoId },
      relations: ['task'],
    });
  }

  findByMaterial(materialId: number) {
    return this.taskContentRepo.find({
      where: { material_id: materialId },
      relations: ['task'],
    });
  }
}