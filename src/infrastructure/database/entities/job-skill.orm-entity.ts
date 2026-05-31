import { IJobSkillEntity } from 'src/domain/entities/job-skill.entity';
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
import { JobOrmEntity } from './job.orm-entity';
import { SkillOrmEntity } from './skill.orm-entity';

@Entity('job_skills')
@Index('idx_job_skills_job_id', ['jobId'])
@Index('idx_job_skills_skill_id', ['skillId'])
@Index('uq_job_skills_job_skill', ['jobId', 'skillId'], { unique: true })
export class JobSkillOrmEntity implements IJobSkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @Column({ name: 'weight', type: 'float', nullable: true, default: 1 })
  weight?: number;

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

  @ManyToOne(() => JobOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: JobOrmEntity;

  @ManyToOne(() => SkillOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillOrmEntity;
}
