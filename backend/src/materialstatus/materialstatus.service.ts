import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialStatus } from './materialstatus.entity';

@Injectable()
export class MaterialStatusService {
  constructor(
    @InjectRepository(MaterialStatus)
    private readonly materialStatusRepo: Repository<MaterialStatus>,
  ) {}

  async upsert(data: { user_id: number; material_id: number; completed: boolean }) {
    const existing = await this.materialStatusRepo.findOne({
      where: { user_id: data.user_id, material_id: data.material_id },
    });
    if (existing) {
      existing.completed = data.completed;
      return this.materialStatusRepo.save(existing);
    }
    const status = this.materialStatusRepo.create(data);
    return this.materialStatusRepo.save(status);
  }

  findByUser(userId: number) {
    return this.materialStatusRepo.find({
      where: { user_id: userId },
      relations: ['material'],
    });
  }

  async findCompletionsByMaterial(materialId: number) {
    const total = await this.materialStatusRepo.count({ where: { material_id: materialId } });
    const completed = await this.materialStatusRepo.count({
      where: { material_id: materialId, completed: true },
    });
    return { material_id: materialId, total, completed };
  }

  async findOne(userId: number, materialId: number) {
    const status = await this.materialStatusRepo.findOne({
      where: { user_id: userId, material_id: materialId },
      relations: ['material'],
    });
    if (!status)
      throw new NotFoundException(
        `Status do material #${materialId} para o usuário #${userId} não encontrado`,
      );
    return status;
  }
}