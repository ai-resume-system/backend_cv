import { IFavouriteJobEntity } from 'src/domain/entities/favourite-job.entity';
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
import { UserOrmEntity } from './user.orm-entity';

@Entity('favourite_jobs')
@Index('idx_favourite_jobs_user_job', ['userId', 'jobId'], { unique: true })
export class FavouriteJobOrmEntity implements IFavouriteJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  @Index()
  jobId: string;

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

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => JobOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: JobOrmEntity;
}
