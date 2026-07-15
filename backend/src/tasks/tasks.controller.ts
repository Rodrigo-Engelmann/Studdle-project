import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Task } from './tasks.entity';
import { TaskService } from './tasks.service';

@Controller('tasks')
export class TaskController extends BaseController<Task> {
  constructor(private readonly taskService: TaskService) {
    super(taskService);
  }

  // Retorna os conteúdos (materiais/vídeos) vinculados a uma task
  @Get(':id/contents')
  findContents(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findContents(id);
  }

  // Retorna o quiz vinculado a uma task
  @Get(':id/quiz')
  findQuiz(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findQuiz(id);
  }

  // Retorna quantos usuários completaram esta task
  @Get(':id/completions')
  findCompletions(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findCompletions(id);
  }
}