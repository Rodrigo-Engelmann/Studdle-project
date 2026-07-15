import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Quiz } from './quizzes.entity';
import { QuizService } from './quizzes.service';

@Controller('quizzes')
export class QuizController extends BaseController<Quiz> {
  constructor(private readonly quizService: QuizService) {
    super(quizService);
  }

  // Retorna todos os quizzes de um módulo
  @Get('module/:moduleId')
  findByModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.quizService.findByModule(moduleId);
  }

  // Retorna as imagens de um quiz
  @Get(':id/images')
  findImages(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.findImages(id);
  }

  // Retorna as opções de um quiz
  @Get(':id/options')
  findOptions(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.findOptions(id);
  }

  // Retorna o quiz completo (com imagens e opções)
  @Get(':id/full')
  findFull(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.findFull(id);
  }

  // Registra uma tentativa de resposta do usuário
  @Post(':id/answer')
  submitAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { option_index: number },
  ) {
    return this.quizService.submitAnswer(id, data.option_index);
  }

  // Retorna estatísticas de acerto/erro do quiz
  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.getStats(id);
  }
}