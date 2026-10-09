import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { TaskContent } from './task_contents.entity';
import { TaskContentService } from './task_contents.service';
import { TaskContentStatusService } from '../taskcontent-status/taskcontent-status.service';

@Controller('task-contents')
export class TaskContentController extends BaseController<TaskContent> {
  constructor(
    private readonly taskContentService: TaskContentService,
    private readonly taskContentStatusService: TaskContentStatusService,
  ) {
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

  // Marca um task_content como concluído para um usuário
  @Patch(':taskContentId/complete/user/:userId')
  markComplete(
    @Param('taskContentId', ParseIntPipe) taskContentId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.taskContentStatusService.markComplete(userId, taskContentId);
  }

  // Retorna o status de conclusão de um task_content para um usuário
  @Get(':taskContentId/status/user/:userId')
  getStatus(
    @Param('taskContentId', ParseIntPipe) taskContentId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.taskContentStatusService.findOne(userId, taskContentId);
  }
}
