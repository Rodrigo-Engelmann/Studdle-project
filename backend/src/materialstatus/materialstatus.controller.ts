import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { MaterialStatusService } from './materialstatus.service';

// Não estende BaseController pois usa PK composta (user_id + material_id)
@Controller('material-status')
export class MaterialStatusController {
  constructor(private readonly materialStatusService: MaterialStatusService) {}

  // Cria ou atualiza o status de um material para um usuário
  @Post()
  upsert(
    @Body() data: { user_id: number; material_id: number; completed: boolean },
  ) {
    return this.materialStatusService.upsert(data);
  }

  // Retorna o status de todos os materiais de um usuário
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.materialStatusService.findByUser(userId);
  }

  // Retorna quantos usuários concluíram um material
  @Get('material/:materialId/completions')
  findCompletionsByMaterial(
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.materialStatusService.findCompletionsByMaterial(materialId);
  }

  // Retorna o status de um material específico para um usuário específico
  @Get('user/:userId/material/:materialId')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.materialStatusService.findOne(userId, materialId);
  }
}