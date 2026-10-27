import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Comment } from '../comments/comments.entity';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  user_id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  text!: string | null;

  @Column({ default: false })
  readed!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  page_link!: string | null;

  @Column({ length: 30, default: 'generic' })
  type!: string;

  @Column({ nullable: true })
  comment_id!: number | null;

  @CreateDateColumn({
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'comment_id' })
  comment!: Comment | null;
}
