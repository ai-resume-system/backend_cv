import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyOrmEntity } from './company.orm-entity';

@Entity({ name: 'career_categories' })
@Index('idx_career_categories_status', ['status'])
@Index('idx_career_categories_name', ['name'])
export class CareerCategoryOrmEntity implements ICareerCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ECareerCategoriesStatus,
    default: ECareerCategoriesStatus.ACTIVE,
  })
  status: ECareerCategoriesStatus;

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

  @OneToMany(() => CompanyOrmEntity, (company) => company.careerCategory)
  companies: CompanyOrmEntity[];
}
