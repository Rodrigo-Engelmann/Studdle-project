import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/users.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 64, nullable: true })
  tokenLookup!: string;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @Column({ nullable: true })
  deviceInfo!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => (user as any).refreshTokens, {
    onDelete: 'CASCADE',
  })
  user!: User;
}
