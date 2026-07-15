import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MaterialStatus } from '../materialstatus/materialstatus.entity';
import { Comment } from '../comments/comments.entity';
import { TaskContent } from '../task_contents/task_contents.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  main_image!: string;

  @Column({ length: 250 })
  summary!: string;

  @Column({ type: 'text' })
  main_content!: string;

  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  last_update!: Date;

  @Column({ unique: true })
  sequence!: number;

  @OneToMany(() => MaterialStatus, (ms) => ms.material)
  material_statuses!: MaterialStatus[];

  @OneToMany(() => Comment, (comment) => comment.material)
  comments!: Comment[];

  @OneToMany(() => TaskContent, (tc) => tc.material)
  task_contents!: TaskContent[];
}