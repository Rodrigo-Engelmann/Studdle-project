import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserTaskService } from './user_tasks.service';

// Não estende BaseController pois usa PK composta (user_id + task_id)
@Controller('user-tasks')
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) {}

  // Cria ou atualiza o vínculo entre usuário e task
  @Post()
  upsert(
    @Body() data: { user_id: number; task_id: number; completed: boolean; engine_task?: boolean; engine_task_count?: number },
  ) {
    return this.userTaskService.upsert(data);
  }

  // Retorna todas as tasks de um usuário com status
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userTaskService.findByUser(userId);
  }

  // Retorna todas as tasks concluídas de um usuário
  @Get('user/:userId/completed')
  findCompletedByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userTaskService.findCompletedByUser(userId);
  }

  // Retorna as tasks de engine de um usuário (uso interno)
  @Get('user/:userId/engine')
  findEngineTasks(@Param('userId', ParseIntPipe) userId: number) {
    return this.userTaskService.findEngineTasks(userId);
  }

  // Marca uma task como concluída para um usuário
  @Patch('user/:userId/task/:taskId/complete')
  markComplete(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.userTaskService.markComplete(userId, taskId);
  }

  // Incrementa o contador de engine_task
  @Patch('user/:userId/task/:taskId/engine-count')
  incrementEngineCount(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.userTaskService.incrementEngineCount(userId, taskId);
  }
}