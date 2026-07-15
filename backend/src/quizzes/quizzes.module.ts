import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quizzes.entity';
import { QuizImage } from '../quizimages/quizimages.entity';
import { QuizOption } from '../quizoptions/quizoptions.entity';
 
@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizImage, QuizOption])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class QuizModule {}
 