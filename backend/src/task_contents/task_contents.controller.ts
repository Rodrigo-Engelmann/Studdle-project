import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { TaskContent } from './task_contents.entity';
import { TaskContentService } from './task_contents.service';

@Controller('task-contents')
export class TaskContentController extends BaseController<TaskContent> {
  constructor(private readonly taskContentService: TaskContentService) {
    super(taskContentService);
  }

  // Retorna todos os conteúdos vinculados a uma task
  @Get('task/:taskId')
  findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.taskContentService.findByTask(taskId);
  }

  // Retorna todos os task-contents que referenciam um vídeo
  @Get('video/:videoId')
  findByVideo(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.taskContentService.findByVideo(videoId);
  }

  // Retorna todos os task-contents que referenciam um material
  @Get('material/:materialId')
  findByMaterial(@Param('materialId', ParseIntPipe) materialId: number) {
    return this.taskContentService.findByMaterial(materialId);
  }
}