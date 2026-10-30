import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { UpdateTaskContentDto } from './dto/update-task.dto';
import { TaskContent } from '../task_contents/task_contents.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  create(data: Partial<Task>) {
    const task = this.taskRepo.create(data);
    return this.taskRepo.save(task);
  }

  findAll() {
    return this.taskRepo.find({ relations: ['module'] });
  }

  async findByModule(moduleId: number) {
    return this.taskRepo.find({
      where: {
        module: {
          id: moduleId,
        },
      },
      relations: ['module'],
    });
  }

  async findById(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['task_contents'],
    });
    if (!task) throw new NotFoundException(`Tarefa #${id} não encontrada`);
    return task;
  }

  async updateContent(taskId: number, dto: UpdateTaskContentDto) {
    return this.taskRepo.manager.transaction(async (manager) => {
      const task = await manager.findOne(Task, { where: { id: taskId } });
      if (!task)
        throw new NotFoundException(`Tarefa #${taskId} não encontrada`);

      await manager.delete(TaskContent, { task_id: taskId });
      const rows: Partial<TaskContent>[] = [
        ...(dto.video_ids ?? []).map((video_id) => ({
          task_id: taskId,
          video_id,
        })),
        ...(dto.material_ids ?? []).map((material_id) => ({
          task_id: taskId,
          material_id,
        })),
      ];

      if (!rows.length) return [];

      return manager.save(TaskContent, manager.create(TaskContent, rows));
    });
  }

  async update(id: number, data: Partial<Task>) {
    await this.findById(id);
    await this.taskRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.taskRepo.delete(id);
    return { deleted: true };
  }

  async findContents(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: [
        'task_contents',
        'task_contents.video',
        'task_contents.material',
      ],
    });
    if (!task) throw new NotFoundException(`Task #${id} não encontrada`);
    return task.task_contents;
  }

  async findQuiz(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['quizzes', 'quizzes.images', 'quizzes.options'],
    });
    if (!task) throw new NotFoundException(`Task #${id} não encontrada`);
    return task.quizzes;
  }
}
