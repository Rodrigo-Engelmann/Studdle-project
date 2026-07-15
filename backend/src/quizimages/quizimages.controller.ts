import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { QuizImage } from './quizimages.entity';
import { QuizImageService } from './quizimages.service';

@Controller('quiz-images')
export class QuizImageController extends BaseController<QuizImage> {
  constructor(private readonly quizImageService: QuizImageService) {
    super(quizImageService);
  }

  // Retorna todas as imagens de um quiz específico
  @Get('quiz/:quizId')
  findByQuiz(@Param('quizId', ParseIntPipe) quizId: number) {
    return this.quizImageService.findByQuiz(quizId);
  }

  // Remove todas as imagens de um quiz específico
  @Delete('quiz/:quizId')
  removeByQuiz(@Param('quizId', ParseIntPipe) quizId: number) {
    return this.quizImageService.removeByQuiz(quizId);
  }
}