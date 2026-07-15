import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Module } from './modules.entity';
import { ModuleService } from './modules.service';

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
}