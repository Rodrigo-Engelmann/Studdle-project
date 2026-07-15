import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Module } from '../modules/modules.entity';
import { TaskContent } from '../task_contents/task_contents.entity';
import { UserTask } from '../user_tasks/user_tasks.entity';
import { Quiz } from '../quizzes/quizzes.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column()
  module_id!: number;

  @ManyToOne(() => Module, (module) => module.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  @OneToMany(() => TaskContent, (tc) => tc.task)
  task_contents!: TaskContent[];

  @OneToMany(() => UserTask, (ut) => ut.task)
  user_tasks!: UserTask[];

  @OneToMany(() => Quiz, (quiz) => quiz.task)
  quizzes!: Quiz[];
}