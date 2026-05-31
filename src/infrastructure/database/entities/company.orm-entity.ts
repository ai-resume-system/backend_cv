import { ICompanyEntity } from 'src/domain/entities/company.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
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
@Index('idx_companies_name', ['name'])
export class CompanyOrmEntity implements ICompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  @Index('idx_companies_slug', { unique: true })
  slug: string;

  @Column({ name: 'career_category_id', type: 'uuid', nullable: true })
  careerCategoryId?: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string | null;

  @Column({ name: 'banner_url', type: 'text', nullable: true })
  bannerUrl?: string | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'latitude', type: 'float', nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'float', nullable: true })
  longitude?: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'tax_code', type: 'varchar', length: 20, nullable: true })
  taxCode?: string;

  @Column({ name: 'website_url', type: 'varchar', length: 255, nullable: true })
  websiteUrl?: string;

  @Column({ name: 'employee_min', type: 'int', nullable: true })
  employeeMin?: number;

  @Column({ name: 'employee_max', type: 'int', nullable: true })
  employeeMax?: number;

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

  @ManyToOne(() => CareerCategoryOrmEntity, (career) => career.companies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'career_category_id' })
  careerCategory?: CareerCategoryOrmEntity;

  @OneToOne(() => UserOrmEntity, (user) => user.userCompany)
  @JoinColumn({ name: 'user_id' })
  userCompany: UserOrmEntity;

  @OneToMany(() => JobOrmEntity, (job) => job.company)
  jobs: JobOrmEntity[];
}
