import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskContentStatus } from './taskcontent-status.entity';
import { User } from '../users/users.entity';

@Injectable()
export class TaskContentStatusService {
  constructor(
    @InjectRepository(TaskContentStatus)
    private readonly statusRepo: Repository<TaskContentStatus>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(data: Partial<TaskContentStatus>) {
    const status = this.statusRepo.create(data);
    return this.statusRepo.save(status);
  }

  findAll() {
    return this.statusRepo.find({ relations: ['user', 'task_content'] });
  }

  async findById(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
      relations: ['user', 'task_content'],
    });
    if (!status)
      throw new NotFoundException(`TaskContentStatus #${id} não encontrado`);
    return status;
  }

  async update(id: number, data: Partial<TaskContentStatus>) {
    await this.findById(id);
    await this.statusRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.statusRepo.delete(id);
    return { deleted: true };
  }

  // Retorna todos os status de um usuário (com task_content populado)
  async findByUser(userId: number, moduleId?: number) {
    let targetModuleId = moduleId;

    // sem módulo informado: usa o módulo atual do usuário
    if (targetModuleId === undefined) {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'current_module_id'],
      });
      if (!user)
        throw new NotFoundException(`Usuário #${userId} não encontrado`);

      targetModuleId = user.current_module_id;
    }

    return this.statusRepo.find({
      where: {
        user_id: userId,
        task_content: { task: { module_id: targetModuleId } },
      },
      relations: [
        'task_content',
        'task_content.task',
        'task_content.video',
        'task_content.material',
      ],
    });
  }

  // Retorna somente os concluídos de um usuário
  findCompletedByUser(userId: number) {
    return this.statusRepo.find({
      where: { user_id: userId, completed: true },
      relations: ['task_content'],
    });
  }

  // Retorna quantos usuários concluíram um task_content
  async findCompletionsByTaskContent(taskContentId: number) {
    const total = await this.statusRepo.count({
      where: { task_content_id: taskContentId },
    });
    const completed = await this.statusRepo.count({
      where: { task_content_id: taskContentId, completed: true },
    });
    return { task_content_id: taskContentId, total, completed };
  }

  // Retorna o status de um task_content específico para um usuário
  async findOne(userId: number, taskContentId: number) {
    const status = await this.statusRepo.findOne({
      where: { user_id: userId, task_content_id: taskContentId },
      relations: ['task_content'],
    });

    // Retorna null se ainda não existe registro (estado válido = não iniciado)
    return status ?? null;
  }

  // Marca um task_content como concluído para um usuário (upsert)
  async markComplete(userId: number, taskContentId: number) {
    const existing = await this.statusRepo.findOne({
      where: { user_id: userId, task_content_id: taskContentId },
    });
    if (existing) {
      existing.completed = true;
      return this.statusRepo.save(existing);
    }
    const status = this.statusRepo.create({
      user_id: userId,
      task_content_id: taskContentId,
      completed: true,
    });
    return this.statusRepo.save(status);
  }
}
