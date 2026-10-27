import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './materials.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
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
    if (!material)
      throw new NotFoundException(`Material #${id} não encontrado`);
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
    if (!material)
      throw new NotFoundException(`Material #${id} não encontrado`);
    return material.comments;
  }

  async findByURL(url: string) {
    const video = await this.materialRepo.findOne({
      where: { link: url },
    });
    if (!video) throw new NotFoundException(`Vídeo #${url} não encontrado`);

    return video;
  }

  // materials.service.ts
  async getNextMaterials(userId: number, moduleId: number) {
    return this.materialRepo
      .createQueryBuilder('m')
      .innerJoin('m.task_contents', 'tc')
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
      .orderBy('m.sequence', 'ASC')
      .limit(4)
      .getMany();
  }

  // materials.service.ts
  async findByModule(userId: number, moduleId: number) {
    // 1 - todos os materiais do módulo, ordenados pela sequência
    const materials = await this.materialRepo
      .createQueryBuilder('m')
      .innerJoin('m.task_contents', 'tc')
      .innerJoin('tc.task', 't')
      .where('t.module_id = :moduleId', { moduleId })
      .distinct(true)
      .orderBy('m.sequence', 'ASC')
      .getMany();

    if (!materials.length) return [];

    const materialIds = materials.map((m) => m.id);

    // 2 - task_id de cada material (dentro do módulo)
    const taskRows = await this.materialRepo
      .createQueryBuilder('m')
      .select('m.id', 'material_id')
      .addSelect('t.id', 'task_id')
      .innerJoin('m.task_contents', 'tc')
      .innerJoin('tc.task', 't')
      .where('t.module_id = :moduleId', { moduleId })
      .andWhere('m.id IN (:...ids)', { ids: materialIds })
      .orderBy('t.id', 'ASC')
      .getRawMany<{ material_id: number; task_id: number }>();

    const taskIdByMaterial = new Map<number, number>();
    for (const row of taskRows) {
      const materialId = Number(row.material_id);
      // se o material estiver em mais de uma task, mantém a de menor id
      if (!taskIdByMaterial.has(materialId)) {
        taskIdByMaterial.set(materialId, Number(row.task_id));
      }
    }

    // 3 - ids dos materiais que o usuário já concluiu
    const readRows = await this.materialRepo
      .createQueryBuilder('m')
      .select('DISTINCT m.id', 'id')
      .innerJoin('m.task_contents', 'tc')
      .innerJoin('taskcontent_status', 'tcs', 'tcs.task_content_id = tc.id')
      .where('tcs.user_id = :userId', { userId })
      .andWhere('tcs.completed = true')
      .andWhere('m.id IN (:...ids)', { ids: materialIds })
      .getRawMany<{ id: number }>();

    const readIds = new Set(readRows.map((r) => Number(r.id)));

    // 4 - junta o resultado
    return materials.map((material) => ({
      ...material,
      task_id: taskIdByMaterial.get(material.id) ?? null,
      watched: readIds.has(material.id),
    }));
  }
}
