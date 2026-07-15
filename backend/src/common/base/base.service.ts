import { Repository, DeepPartial } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class BaseService<T extends object> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    return entity;
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);

    Object.assign(entity, data);

    return this.repository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findById(id);
    return this.repository.remove(entity);
  }
}