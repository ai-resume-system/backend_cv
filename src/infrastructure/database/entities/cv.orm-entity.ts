import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ECVStatus } from 'src/common/constants/enum/cv.enum';
import { UserOrmEntity } from './user.orm-entity';
import { CareerCategoryOrmEntity } from './career-category.orm-entity';
import { ICVEntity } from 'src/domain/entities/cv.entity';

@Entity('cvs')
@Index(['deletedAt', 'status'])
export class CVOrmEntity implements ICVEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ type: 'text', nullable: true })
  education?: string;

  @Column({ type: 'text', nullable: true })
  experience?: string;

  @Column({ type: 'text', nullable: true })
  skills?: string;

  @Column({ type: 'text', nullable: true })
  languages?: string;

  @Column({ type: 'text', nullable: true })
  certifications?: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl?: string;

  @Column({
    type: 'enum',
    enum: ECVStatus,
    default: ECVStatus.ACTIVE,
  })
  status: ECVStatus;

  @ManyToOne(() => UserOrmEntity, (user) => user.cvs, {
    onDelete: 'CASCADE',
  })
  user: UserOrmEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => CareerCategoryOrmEntity, { nullable: true })
  careerCategory?: CareerCategoryOrmEntity;

  @Column({ name: 'career_category_id', type: 'uuid', nullable: true })
  careerCategoryId?: string;

  @Index()
  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
