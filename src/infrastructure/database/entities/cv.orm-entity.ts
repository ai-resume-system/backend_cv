import {
  ECVStatus,
  EProcessingStatus,
} from 'src/common/constants/enum/cv.enum';
import { ICVEntity } from 'src/domain/entities/cv.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('cvs')
@Index(['deletedAt', 'status'])
@Index(['userId', 'isDefault'])
@Index(['userId', 'createdAt'])
export class CVOrmEntity implements ICVEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl?: string;

  @Column({ name: 'file_extension', type: 'varchar', length: 20, nullable: true })
  fileExtension?: string;

  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: EProcessingStatus,
  })
  processingStatus?: EProcessingStatus;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault?: boolean;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string;

  @Column({
    type: 'enum',
    enum: ECVStatus,
    default: ECVStatus.ACTIVE,
  })
  status: ECVStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @ManyToOne(() => UserOrmEntity, (user) => user.cvs, {
    onDelete: 'CASCADE',
  })
  user: UserOrmEntity;
}
