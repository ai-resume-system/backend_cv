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
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import { CVOrmEntity } from './cv.orm-entity';
import { UserOrmEntity } from './user.orm-entity';
import { JobOrmEntity } from './job.orm-entity';

@Entity('job_applications')
@Index(['deletedAt', 'status'])
@Index('idx_job_applications_user_job', ['userId', 'jobId'], { unique: true })
@Index('idx_job_applications_cv', ['cvId'], { unique: false })
@Index('idx_job_applications_job', ['jobId'], { unique: false })
@Index('idx_job_applications_matching_score', ['matchingScore'], {
  unique: false,
})
export class JobApplicationOrmEntity implements IJobApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cv_id', type: 'uuid' })
  @Index()
  cvId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  @Index()
  jobId: string;

  @Column({
    name: 'matching_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  matchingScore?: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EJobApplicationStatus,
    default: EJobApplicationStatus.APPLIED,
  })
  @Index()
  status: EJobApplicationStatus;

  @Column({ name: 'schedule_time', type: 'timestamptz', nullable: true })
  scheduleTime?: Date;

  @Column({
    name: 'schedule_location',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  scheduleLocation?: string;

  @Column({ name: 'schedule_link', type: 'text', nullable: true })
  scheduleLink?: string;

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

  @ManyToOne(() => CVOrmEntity, (cv) => cv.jobApplications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cv_id' })
  cv: CVOrmEntity;

  @ManyToOne(() => UserOrmEntity, (user) => user.jobApplications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => JobOrmEntity, (job) => job.jobApplications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: JobOrmEntity;
}
