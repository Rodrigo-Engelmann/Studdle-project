import { Controller, Get, Post, Param, Body, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Material } from './materials.entity';
import { MaterialService } from './materials.service';

import{ ImageUploadInterceptor } from '../common/upload/image-upload.interceptor'

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

  @Post('upload')
  @UseInterceptors(
    ImageUploadInterceptor('main_image', 'materials')
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/materials/${file.filename}`,
    };
  }
}