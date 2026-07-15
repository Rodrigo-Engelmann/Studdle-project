import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Material } from '../materials/materials.entity';

@Entity('materialstatus')
export class MaterialStatus {
  @PrimaryColumn()
  user_id!: number;

  @PrimaryColumn()
  material_id!: number;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(() => User, (user) => user.material_statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Material, (material) => material.material_statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'material_id' })
  material!: Material;
}