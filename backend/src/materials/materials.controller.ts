import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Material } from './materials.entity';
import { MaterialService } from './materials.service';

@Controller('materials')
export class MaterialController extends BaseController<Material> {
  constructor(private readonly materialService: MaterialService) {
    super(materialService);
  }

  // Retorna materiais ordenados pela sequência
  @Get('ordered')
  findOrdered() {
    return this.materialService.findOrdered();
  }

  // Retorna os comentários de um material
  @Get(':id/comments')
  findComments(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findComments(id);
  }

  // Marca o material como concluído para um usuário
  @Post(':id/complete')
  markComplete(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id', ParseIntPipe) userId: number,
  ) {
    return this.materialService.markComplete(id, userId);
  }

  // Retorna o status de conclusão do material para um usuário
  @Get(':id/status/:userId')
  getStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.materialService.getStatus(id, userId);
  }
}