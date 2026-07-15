import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Quiz } from '../quizzes/quizzes.entity';

@Entity('quizimages')
export class QuizImage {
  @PrimaryColumn()
  quiz_id!: number;

  @Column({ length: 255, nullable: true })
  image!: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;
}