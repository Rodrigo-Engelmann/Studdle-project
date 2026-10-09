import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { TaskContent } from '../task_contents/task_contents.entity';

@Entity('taskcontent_status')
export class TaskContentStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  task_content_id!: number;

  @Column()
  user_id!: number;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => TaskContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_content_id' })
  task_content!: TaskContent;
}
