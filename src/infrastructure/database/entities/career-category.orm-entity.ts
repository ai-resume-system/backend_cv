import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { CompanyOrmEntity } from './company.orm-entity';

@Entity({ name: 'career_categories' })
export class CareerCategoryOrmEntity implements ICareerCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ECareerCategoriesStatus,
    default: ECareerCategoriesStatus.ACTIVE,
  })
  status: ECareerCategoriesStatus;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => CompanyOrmEntity, (company) => company.career_categories)
  company: CompanyOrmEntity;
}
