import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Video } from '../videos/videos.entity';

@Entity('videostatus')
export class VideoStatus {
  @PrimaryColumn()
  user_id!: number;

  @PrimaryColumn()
  video_id!: number;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(() => User, (user) => user.video_statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Video, (video) => video.video_statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video!: Video;
}