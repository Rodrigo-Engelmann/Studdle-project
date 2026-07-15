import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  user_id!: number;

  @Column({ length: 50, nullable: true })
  text!: string;

  @Column({ default: false })
  readed!: boolean;

  @Column({ length: 255 })
  page_link!: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}