import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTask } from './user_tasks.entity';

@Injectable()
export class UserTaskService {
  constructor(
    @InjectRepository(UserTask)
    private readonly userTaskRepo: Repository<UserTask>,
  ) {}

  async upsert(data: {
    user_id: number;
    task_id: number;
    completed: boolean;
    engine_task?: boolean;
    engine_task_count?: number;
  }) {
    const existing = await this.userTaskRepo.findOne({
      where: { user_id: data.user_id, task_id: data.task_id },
    });
    if (existing) {
      Object.assign(existing, data);
      return this.userTaskRepo.save(existing);
    }
    const userTask = this.userTaskRepo.create(data);
    return this.userTaskRepo.save(userTask);
  }

  findByUser(userId: number) {
    return this.userTaskRepo.find({
      where: { user_id: userId },
      relations: ['task', 'task.module'],
    });
  }

  findCompletedByUser(userId: number) {
    return this.userTaskRepo.find({
      where: { user_id: userId, completed: true },
      relations: ['task'],
    });
  }

  findEngineTasks(userId: number) {
    return this.userTaskRepo.find({
      where: { user_id: userId, engine_task: true },
      relations: ['task'],
    });
  }

  async markComplete(userId: number, taskId: number) {
    const userTask = await this.userTaskRepo.findOne({
      where: { user_id: userId, task_id: taskId },
    });
    if (!userTask)
      throw new NotFoundException(
        `UserTask do usuário #${userId} e task #${taskId} não encontrada`,
      );
    userTask.completed = true;
    return this.userTaskRepo.save(userTask);
  }

  async incrementEngineCount(userId: number, taskId: number) {
    const userTask = await this.userTaskRepo.findOne({
      where: { user_id: userId, task_id: taskId },
    });
    if (!userTask)
      throw new NotFoundException(
        `UserTask do usuário #${userId} e task #${taskId} não encontrada`,
      );
    userTask.engine_task_count = (userTask.engine_task_count ?? 0) + 1;
    return this.userTaskRepo.save(userTask);
  }
}