import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from '../tasks/tasks.entity';
import { Video } from '../videos/videos.entity';
import { Material } from '../materials/materials.entity';

@Entity('task_contents')
export class TaskContent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  task_id!: number;

  @Column({ nullable: true })
  video_id!: number;

  @Column({ nullable: true })
  material_id!: number;

  @ManyToOne(() => Task, (task) => task.task_contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @ManyToOne(() => Video, (video) => video.task_contents, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'video_id' })
  video!: Video;

  @ManyToOne(() => Material, (material) => material.task_contents, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'material_id' })
  material!: Material;
}