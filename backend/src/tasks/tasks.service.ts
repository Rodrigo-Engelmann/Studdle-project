import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';

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

  async findById(id: number) {
    const task = await this.taskRepo.findOne({ where: { id }, relations: ['module'] });
    if (!task) throw new NotFoundException(`Task #${id} não encontrada`);
    return task;
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
      relations: ['task_contents', 'task_contents.video', 'task_contents.material'],
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

  async findCompletions(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['user_tasks'],
    });
    if (!task) throw new NotFoundException(`Task #${id} não encontrada`);
    const completed = task.user_tasks.filter((ut) => ut.completed).length;
    return { task_id: id, total: task.user_tasks.length, completed };
  }
}