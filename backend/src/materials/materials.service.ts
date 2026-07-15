import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './materials.entity';
import { MaterialStatus } from '../materialstatus/materialstatus.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @InjectRepository(MaterialStatus)
    private readonly materialStatusRepo: Repository<MaterialStatus>,
  ) {}

  create(data: Partial<Material>) {
    const material = this.materialRepo.create(data);
    return this.materialRepo.save(material);
  }

  findAll() {
    return this.materialRepo.find();
  }

  async findById(id: number) {
    const material = await this.materialRepo.findOne({ where: { id } });
    if (!material) throw new NotFoundException(`Material #${id} não encontrado`);
    return material;
  }

  async update(id: number, data: Partial<Material>) {
    await this.findById(id);
    await this.materialRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.materialRepo.delete(id);
    return { deleted: true };
  }

  findOrdered() {
    return this.materialRepo.find({ order: { sequence: 'ASC' } });
  }

  async findComments(id: number) {
    const material = await this.materialRepo.findOne({
      where: { id },
      relations: ['comments', 'comments.user'],
    });
    if (!material) throw new NotFoundException(`Material #${id} não encontrado`);
    return material.comments;
  }

  async markComplete(materialId: number, userId: number) {
    await this.findById(materialId);
    const existing = await this.materialStatusRepo.findOne({
      where: { material_id: materialId, user_id: userId },
    });
    if (existing) {
      existing.completed = true;
      return this.materialStatusRepo.save(existing);
    }
    const status = this.materialStatusRepo.create({
      material_id: materialId,
      user_id: userId,
      completed: true,
    });
    return this.materialStatusRepo.save(status);
  }

  async getStatus(materialId: number, userId: number) {
    const status = await this.materialStatusRepo.findOne({
      where: { material_id: materialId, user_id: userId },
    });
    return status ?? { material_id: materialId, user_id: userId, completed: false };
  }
}