import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Quiz } from './quizzes.entity';
// import { QuizImage } from '../quizimages/quizimages.entity';
import { QuizOption } from '../quizoptions/quizoptions.entity';

import { QuizController } from './quizzes.controller';
import { QuizService } from './quizzes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      // QuizImage,
      QuizOption,
    ]),
    HttpModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
