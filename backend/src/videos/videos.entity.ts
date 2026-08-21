import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VideoStatus } from '../videostatus/videostatus.entity';
import { Comment } from '../comments/comments.entity';
import { TaskContent } from '../task_contents/task_contents.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 500, nullable: true })
  link!: string;

  @Column({ length: 500, nullable: true })
  video_url!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @Column({ length: 100 })
  title!: string;

  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  last_update!: Date;

  @Column({ unique: true })
  sequence!: number;

  @OneToMany(() => VideoStatus, (vs) => vs.video)
  video_statuses!: VideoStatus[];

  @OneToMany(() => Comment, (comment) => comment.video)
  comments!: Comment[];

  @OneToMany(() => TaskContent, (tc) => tc.video)
  task_contents!: TaskContent[];
}