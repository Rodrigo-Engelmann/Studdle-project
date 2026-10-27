import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { TaskContentStatus } from './taskcontent-status.entity';
import { TaskContentStatusService } from './taskcontent-status.service';

@Controller('taskcontent-status')
export class TaskContentStatusController extends BaseController<TaskContentStatus> {
  constructor(
    private readonly taskContentStatusService: TaskContentStatusService,
  ) {
    super(taskContentStatusService);
  }

  // Retorna todos os status de um usuário
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('module_id', new ParseIntPipe({ optional: true })) moduleId: number,
  ) {
    return this.taskContentStatusService.findByUser(userId, moduleId);
  }

  // Retorna somente os concluídos de um usuário
  @Get('user/:userId/completed')
  findCompletedByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.taskContentStatusService.findCompletedByUser(userId);
  }

  // Retorna contagem de conclusões de um task_content
  @Get('task-content/:taskContentId/completions')
  findCompletionsByTaskContent(
    @Param('taskContentId', ParseIntPipe) taskContentId: number,
  ) {
    return this.taskContentStatusService.findCompletionsByTaskContent(
      taskContentId,
    );
  }

  // Retorna o status de um task_content para um usuário específico
  @Get('user/:userId/task-content/:taskContentId')
  findOneByUserAndContent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskContentId', ParseIntPipe) taskContentId: number,
  ) {
    return this.taskContentStatusService.findOne(userId, taskContentId);
  }

  // Marca um task_content como concluído para um usuário
  @Patch('user/:userId/task-content/:taskContentId/complete')
  markComplete(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskContentId', ParseIntPipe) taskContentId: number,
  ) {
    return this.taskContentStatusService.markComplete(userId, taskContentId);
  }

  // Cria um registro de status manualmente (se necessário)
  @Post()
  create(@Body() data: Partial<TaskContentStatus>) {
    return this.taskContentStatusService.create(data);
  }
}
