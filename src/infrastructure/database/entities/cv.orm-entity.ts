import { ECVStatus } from 'src/common/constants/enum/cv.enum';
import { ICVEntity } from 'src/domain/entities/cv.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { JobApplicationOrmEntity } from './job-application.orm-entity';

@Entity('cvs')
@Index(['deletedAt', 'status'])
@Index(['userId', 'isDefault'])
@Index(['userId', 'createdAt'])
@Index('idx_cvs_user_status', ['userId', 'status'], { unique: false })
export class CVOrmEntity implements ICVEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl?: string;

  @Column({
    name: 'file_extension',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  fileExtension?: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault?: boolean;

  @Column({
    type: 'enum',
    enum: ECVStatus,
    default: ECVStatus.ACTIVE,
  })
  status: ECVStatus;

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

  @ManyToOne(() => UserOrmEntity, (user) => user.cvs, {
    onDelete: 'CASCADE',
  })
  user: UserOrmEntity;

  @OneToMany(
    () => JobApplicationOrmEntity,
    (jobApplication) => jobApplication.cv,
  )
  jobApplications: JobApplicationOrmEntity[];
}
