import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Video } from '../videos/videos.entity';
import { Material } from '../materials/materials.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column()
  user_id!: number;

  @Column({ nullable: true })
  video_id!: number;

  @Column({ nullable: true })
  material_id!: number;

  @CreateDateColumn()
  publish_date!: Date;

  @Column({ nullable: true })
  mentions_comment!: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Video, (video) => video.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'video_id' })
  video!: Video;

  @ManyToOne(() => Material, (material) => material.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'material_id' })
  material!: Material;

  // Auto-referência para reply de comentários
  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'mentions_comment' })
  parent_comment!: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent_comment)
  replies!: Comment[];
}