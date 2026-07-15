import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Task } from '../tasks/tasks.entity';

@Entity('user_tasks')
export class UserTask {
  @PrimaryColumn()
  user_id!: number;

  @PrimaryColumn()
  task_id!: number;

  @Column({ default: false })
  completed!: boolean;

  @Column({ default: false })
  engine_task!: boolean;

  @Column({ type: 'int', nullable: true, default: null })
  engine_task_count!: number;

  @ManyToOne(() => User, (user) => user.user_tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Task, (task) => task.user_tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;
}