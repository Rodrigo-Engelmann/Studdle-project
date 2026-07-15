import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/users.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  // hash do token gerado (ex: bcrypt)
  @Column()
  tokenHash!: string;

  // quando expira (timestamp)
  @Column({ type: 'datetime' })
  expiresAt!: Date;

  // device info (opcional): user agent / ip / nome do dispositivo
  @Column({ nullable: true })
  deviceInfo!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // relação com o user
  @ManyToOne(() => User, user => (user as any).refreshTokens, { onDelete: 'CASCADE' })
  user!: User;
}
