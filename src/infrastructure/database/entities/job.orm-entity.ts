import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import type { IJobEntity } from 'src/domain/entities/job.entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { CareerCategoryOrmEntity } from './career-category.orm-entity';

@Entity('jobs')
@Index(['deletedAt', 'status'])
export class JobOrmEntity implements IJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'career_category_id', type: 'uuid', nullable: true })
  careerCategoryId?: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'short_description',
    type: 'text',
    nullable: true,
  })
  shortDescription?: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ name: 'salary_min', type: 'int', nullable: true })
  salaryMin?: number;

  @Column({ name: 'salary_max', type: 'int', nullable: true })
  salaryMax?: number;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears?: number;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: EJobType,
    default: EJobType.FULL_TIME,
  })
  jobType: EJobType;

  @Column({ name: 'expired_at', type: 'timestamptz', nullable: true })
  expiredAt?: Date;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EJobStatus,
    default: EJobStatus.PENDING,
  })
  status: EJobStatus;

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

  @ManyToOne(() => CompanyOrmEntity, (company) => company.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: CompanyOrmEntity;

  @ManyToOne(() => CareerCategoryOrmEntity, { nullable: true })
  @JoinColumn({ name: 'career_category_id' })
  careerCategory?: CareerCategoryOrmEntity;
}
