import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Module } from './modules.entity';
import { ModuleService } from './modules.service';

import { ImageUploadInterceptor } from '../common/upload/image-upload.interceptor';

@Controller('modules')
export class ModuleController extends BaseController<Module> {
  constructor(private readonly moduleService: ModuleService) {
    super(moduleService);
  }

  // Retorna todas as tasks vinculadas a um módulo
  @Get(':id/tasks')
  findTasks(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findTasks(id);
  }

  // Retorna todos os quizzes vinculados a um módulo
  @Get(':id/quizzes')
  findQuizzes(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findQuizzes(id);
  }

  // Retorna quantos usuários estão neste módulo
  @Get(':id/users')
  findUsers(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findUsers(id);
  }

  @Post('upload')
  @UseInterceptors(ImageUploadInterceptor('image', 'modules'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/modules/${file.filename}`,
    };
  }
}
