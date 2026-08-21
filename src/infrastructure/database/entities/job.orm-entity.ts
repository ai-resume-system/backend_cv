import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';
import type { IJobEntity } from 'src/domain/entities/job.entity';

import { CareerCategoryOrmEntity } from './career-category.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { JobApplicationOrmEntity } from './job-application.orm-entity';
import { JobSkillOrmEntity } from './job-skill.orm-entity';

@Entity('jobs')
@Index('idx_jobs_admin_created', ['createdAt', 'id'], {
  where: `"deleted_at" IS NULL`,
})
@Index('idx_jobs_admin_status_created', ['status', 'createdAt', 'id'], {
  where: `"deleted_at" IS NULL`,
})
@Index('idx_jobs_company_created', ['companyId', 'createdAt', 'id'], {
  where: `"deleted_at" IS NULL`,
})
@Index(
  'idx_jobs_company_status_created',
  ['companyId', 'status', 'createdAt', 'id'],
  {
    where: `"deleted_at" IS NULL`,
  },
)
@Index(
  'idx_jobs_public_category_status_created',
  ['careerCategoryId', 'status', 'createdAt', 'id'],
  {
    where: `"deleted_at" IS NULL`,
  },
)
@Index(
  'idx_jobs_public_address_status_created',
  ['address', 'status', 'createdAt', 'id'],
  {
    where: `"deleted_at" IS NULL`,
  },
)
@Index('idx_jobs_expired_at', ['expiredAt'], {
  where: `"deleted_at" IS NULL`,
})
@Index('idx_jobs_active_slug', ['slug'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
export class JobOrmEntity implements IJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'company_id',
    type: 'uuid',
  })
  companyId: string;

  @Column({
    name: 'career_category_id',
    type: 'uuid',
    nullable: true,
  })
  careerCategoryId?: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
  })
  slug: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    name: 'short_description',
    type: 'text',
    nullable: true,
  })
  shortDescription?: string;

  @Column({
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address?: string;

  @Column({
    name: 'salary_min',
    type: 'int',
    nullable: true,
  })
  salaryMin?: number;

  @Column({
    name: 'salary_max',
    type: 'int',
    nullable: true,
  })
  salaryMax?: number;

  @Column({
    name: 'experience_years',
    type: 'int',
    nullable: true,
  })
  experienceYears?: number;

  @Column({
    name: 'vacancy_count',
    type: 'int',
    default: 1,
  })
  vacancyCount?: number;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: EJobType,
    default: EJobType.FULL_TIME,
  })
  jobType: EJobType;

  @Column({
    name: 'education_level',
    type: 'enum',
    enum: EJobEducationLevel,
    default: EJobEducationLevel.NONE,
  })
  educationLevel: EJobEducationLevel;

  @Column({
    name: 'work_arrangement',
    type: 'enum',
    enum: EJobWorkArrangement,
    default: EJobWorkArrangement.ONSITE,
  })
  workArrangement: EJobWorkArrangement;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EJobStatus,
    default: EJobStatus.PENDING,
  })
  status: EJobStatus;

  @Column({
    name: 'expired_at',
    type: 'timestamptz',
    nullable: true,
  })
  expiredAt?: Date;

  @Column({
    name: 'reject_reason',
    type: 'text',
    nullable: true,
  })
  rejectReason?: string;

  @Column({
    name: 'close_reason',
    type: 'text',
    nullable: true,
  })
  closeReason?: string;

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

  @ManyToOne(() => CompanyOrmEntity, (company) => company.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: CompanyOrmEntity;

  @ManyToOne(() => CareerCategoryOrmEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'career_category_id' })
  careerCategory?: CareerCategoryOrmEntity;

  @OneToMany(
    () => JobApplicationOrmEntity,
    (jobApplication) => jobApplication.job,
  )
  jobApplications: JobApplicationOrmEntity[];

  @OneToMany(() => JobSkillOrmEntity, (jobSkill) => jobSkill.job)
  jobSkills: JobSkillOrmEntity[];
}
