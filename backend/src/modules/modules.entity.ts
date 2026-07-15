import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToMany,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Task } from '../tasks/tasks.entity';
import { Quiz } from '../quizzes/quizzes.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  module!: number;

  @Column({
    type: 'enum',
    enum: ['beta', 'released'],
    default: 'beta',
  })
  release_status!: 'beta' | 'released';

  @OneToMany(() => User, (user) => user.current_module)
  users!: User[];

  @OneToMany(() => Task, (task) => task.module)
  tasks!: Task[];

  @OneToMany(() => Quiz, (quiz) => quiz.module)
  quizzes!: Quiz[];
}