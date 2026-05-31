import type { ICVParsedDataEntity } from 'src/domain/entities/cv-parsed-data.entity';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CVOrmEntity } from './cv.orm-entity';

@Entity({ name: 'cv_parsed_data' })
@Index('idx_cv_parsed_data_cv_id_created_at', ['cvId', 'createdAt'], {
  unique: false,
})
export class CVParsedDataOrmEntity implements ICVParsedDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cv_id', type: 'uuid' })
  cvId: string;

  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: EProcessingStatus,
    default: EProcessingStatus.PENDING,
  })
  processingStatus: EProcessingStatus;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string;

  @Column({ name: 'raw_text', type: 'text', nullable: true })
  rawText?: string;

  @Column({ name: 'parsed_json', type: 'jsonb', nullable: true })
  parsedJson?: Record<string, unknown>;

  @Column({
    name: 'score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  score: number;

  @Column({ name: 'provider', type: 'varchar', length: 100, nullable: true })
  provider?: string;

  @Column({ name: 'model', type: 'varchar', length: 255, nullable: true })
  model?: string;

  @Column({ name: 'confidence_flags', type: 'jsonb', nullable: true })
  confidenceFlags?: string[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  @ManyToOne(() => CVOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cv_id' })
  cv: CVOrmEntity;
}
