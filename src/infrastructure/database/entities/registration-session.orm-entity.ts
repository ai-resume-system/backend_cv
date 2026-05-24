import type { IRegistrationSessionEntity } from 'src/domain/entities/registration-session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'registration_sessions' })
@Index('IDX_registration_sessions_email', ['email'])
@Index('IDX_registration_sessions_expires_at', ['expiresAt'])
export class RegistrationSessionOrmEntity implements IRegistrationSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'payload', type: 'jsonb', default: {} })
  payload: Record<string, unknown>;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
