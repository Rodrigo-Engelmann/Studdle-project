import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './modules.entity';
import { deleteUploadedFile } from '../common/upload/file.utils';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepo: Repository<Module>,
  ) {}

  create(data: Partial<Module>) {
    const module = this.moduleRepo.create(data);
    return this.moduleRepo.save(module);
  }

  findAll() {
    return this.moduleRepo.find({ order: { module: 'ASC' } });
  }

  async findById(id: number) {
    const module = await this.moduleRepo.findOne({ where: { id } });
    if (!module) throw new NotFoundException(`Módulo #${id} não encontrado`);
    return module;
  }

  async update(id: number, data: Partial<Module>) {
    const module = await this.findById(id);
    const oldImage = module.image;

    await this.moduleRepo.update(id, data);

    if (data.image && oldImage && oldImage !== data.image)
      deleteUploadedFile(oldImage);

    return this.findById(id);
  }

  async remove(id: number) {
    const module = await this.findById(id);
    const image = module.image;

    await this.moduleRepo.delete(id);

    deleteUploadedFile(image);

    return { deleted: true };
  }

  async findTasks(id: number) {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!module) throw new NotFoundException(`Módulo #${id} não encontrado`);
    return module.tasks;
  }

  async findQuizzes(id: number) {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['quizzes'],
    });
    if (!module) throw new NotFoundException(`Módulo #${id} não encontrado`);
    return module.quizzes;
  }

  async findUsers(id: number) {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!module) throw new NotFoundException(`Módulo #${id} não encontrado`);
    return module.users;
  }
}
