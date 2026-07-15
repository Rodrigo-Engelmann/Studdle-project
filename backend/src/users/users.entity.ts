import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Module } from '../modules/modules.entity';
import { MaterialStatus } from '../materialstatus/materialstatus.entity';
import { VideoStatus } from '../videostatus/videostatus.entity';
import { Comment } from '../comments/comments.entity';
import { UserTask } from '../user_tasks/user_tasks.entity';
import { UserNotification } from '../user_notifications/user_notifications.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  user_name!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ length: 255, nullable: true })
  profile_picture!: string;

  @Column({ type: 'smallint', default: 0 })
  colorblindness!: number;

  @Column({ type: 'text', nullable: true })
  account_bio!: string;

  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  last_update!: Date;

  @Column({ default: 0 })
  xp!: number;

  @Column({ nullable: true })
  current_module_id!: number;

  @Column({ type: 'smallint', default: 0 })
  privileges!: number;

  @Column({ default: true })
  comments_notification_ceiling!: boolean;

  @Column({ default: 5 })
  comments_notification_ceiling_number!: number;

  @ManyToOne(() => Module, (module) => module.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'current_module_id' })
  current_module!: Module;

  @OneToMany(() => MaterialStatus, (ms) => ms.user)
  material_statuses!: MaterialStatus[];

  @OneToMany(() => VideoStatus, (vs) => vs.user)
  video_statuses!: VideoStatus[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => UserTask, (ut) => ut.user)
  user_tasks!: UserTask[];

  @OneToMany(() => UserNotification, (n) => n.user)
  notifications!: UserNotification[];
}