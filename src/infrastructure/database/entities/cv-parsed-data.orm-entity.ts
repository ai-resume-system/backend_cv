import type { ICVParsedDataEntity } from 'src/domain/entities/cv-parsed-data.entity';
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
@Index('idx_cv_parsed_data_cv_id', ['cvId'], { unique: true })
export class CVParsedDataOrmEntity implements ICVParsedDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cv_id', type: 'uuid' })
  cvId: string;

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
