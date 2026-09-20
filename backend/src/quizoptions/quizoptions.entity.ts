import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from '../quizzes/quizzes.entity';

@Entity('quizoptions')
export class QuizOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quiz_id!: number;

  @Column({ length: 255, nullable: true })
  text!: string;

  @Column({ default: false })
  right_answer!: boolean;

  @ManyToOne(() => Quiz, (quiz) => quiz.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;
}