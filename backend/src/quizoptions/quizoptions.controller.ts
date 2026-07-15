import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { QuizOption } from './quizoptions.entity';
import { QuizOptionService } from './quizoptions.service';

@Controller('quiz-options')
export class QuizOptionController extends BaseController<QuizOption> {
  constructor(private readonly quizOptionService: QuizOptionService) {
    super(quizOptionService);
  }

  // Retorna todas as opções de um quiz específico
  @Get('quiz/:quizId')
  findByQuiz(@Param('quizId', ParseIntPipe) quizId: number) {
    return this.quizOptionService.findByQuiz(quizId);
  }

  // Retorna somente a opção correta de um quiz
  @Get('quiz/:quizId/correct')
  findCorrect(@Param('quizId', ParseIntPipe) quizId: number) {
    return this.quizOptionService.findCorrect(quizId);
  }

  // Remove todas as opções de um quiz específico
  @Delete('quiz/:quizId')
  removeByQuiz(@Param('quizId', ParseIntPipe) quizId: number) {
    return this.quizOptionService.removeByQuiz(quizId);
  }
}