import { ICompanyEntity } from 'src/domain/entities/company.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CareerCategoryOrmEntity } from './career-category.orm-entity';
import { JobOrmEntity } from './job.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity({ name: 'companies' })
export class CompanyOrmEntity implements ICompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'career_categories_id', type: 'uuid', nullable: true })
  careerCategoriesId?: string;

  @Column({
    name: 'company_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  companyName?: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'location', type: 'text', nullable: true })
  location?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'tax_code', type: 'varchar', length: 20, nullable: true })
  taxCode?: string;

  @Column({ name: 'website_url', type: 'varchar', length: 255, nullable: true })
  websiteUrl?: string;

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

  @ManyToOne(() => CareerCategoryOrmEntity, (career) => career.company)
  @JoinColumn({ name: 'career_categories_id' })
  careerCategories: CareerCategoryOrmEntity;

  @OneToOne(() => UserOrmEntity, (user) => user.userCompany)
  @JoinColumn({ name: 'user_id' })
  userCompany: UserOrmEntity;

  @OneToMany(() => JobOrmEntity, (job) => job.company)
  jobs: JobOrmEntity[];
}
