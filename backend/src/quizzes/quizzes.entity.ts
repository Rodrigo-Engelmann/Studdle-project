import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Module } from '../modules/modules.entity';
import { Task } from '../tasks/tasks.entity';
import { QuizOption } from '../quizoptions/quizoptions.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column()
  module_id!: number;

  @Column()
  task_id!: number;

  @Column({ default: 0 })
  right_answer_count!: number;

  @Column({ default: 0 })
  answer_count!: number;

  @ManyToOne(() => Task, (task) => task.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @ManyToOne(() => Module, (module) => module.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  @Column({ length: 255 })
  image!: string;

  @OneToMany(() => QuizOption, (qo) => qo.quiz, { cascade: true })
  options!: QuizOption[];
}