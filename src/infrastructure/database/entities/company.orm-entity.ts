import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { ICompanyEntity } from 'src/domain/entities/company.entity';
import { CareerCategoryOrmEntity } from './career-category.orm-entity';

@Entity({ name: 'companies' })
export class CompanyOrmEntity implements ICompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  user_id: string;

  @Column({ name: 'career_categories_id', type: 'uuid', nullable: true })
  career_categories_id?: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  company_name?: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logo_url?: string;

  @Column({ name: 'location', type: 'text', nullable: true })
  location?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'tax_code', type: 'varchar', length: 20, nullable: true })
  tax_code?: string;

  @Column({ name: 'website_url', type: 'varchar', length: 255, nullable: true })
  website_url?: string;

  @Column({ name: 'company_size_min', type: 'int', nullable: true })
  company_size_min?: number;

  @Column({ name: 'company_size_max', type: 'int', nullable: true })
  company_size_max?: number;

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

  //relation
  @ManyToOne(() => CareerCategoryOrmEntity, (career) => career.company)
  @JoinColumn({ name: 'career_categories_id' })
  career_categories: CareerCategoryOrmEntity;

  @OneToOne(() => UserOrmEntity, (user) => user.user_company)
  @JoinColumn({ name: 'user_id' })
  user_company: UserOrmEntity;
}
