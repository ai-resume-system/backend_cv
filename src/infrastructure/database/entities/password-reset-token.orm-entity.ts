import type { IPasswordResetTokenEntity } from 'src/domain/entities/password-reset-token.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'password_reset_tokens' })
@Index('IDX_password_reset_tokens_email', ['email'])
@Index('IDX_password_reset_tokens_expires_at', ['expiresAt'])
export class PasswordResetTokenOrmEntity implements IPasswordResetTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'sign_key_hash', type: 'text' })
  signKeyHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
