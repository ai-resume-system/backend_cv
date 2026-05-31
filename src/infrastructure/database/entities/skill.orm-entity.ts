import type { ISkillEntity } from 'src/domain/entities/skill.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CareerCategoryOrmEntity } from './career-category.orm-entity';
import { CVSkillOrmEntity } from './cv-skill.orm-entity';
import { JobSkillOrmEntity } from './job-skill.orm-entity';

@Entity({ name: 'skills' })
@Index('idx_skills_active_name', ['name'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
@Index('idx_skills_active_slug', ['slug'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
@Index('idx_skills_career_category', ['careerCategoryId'], {
  where: `"deleted_at" IS NULL`,
})
@Index('idx_skills_parent', ['parentId'], {
  where: `"deleted_at" IS NULL`,
})
export class SkillOrmEntity implements ISkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'career_category_id', type: 'uuid' })
  careerCategoryId: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
  })
  slug: string;

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

  @ManyToOne(() => CareerCategoryOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'career_category_id' })
  careerCategory: CareerCategoryOrmEntity;

  @ManyToOne(() => SkillOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: SkillOrmEntity;

  @OneToMany(() => SkillOrmEntity, (skill) => skill.parent)
  children: SkillOrmEntity[];

  @OneToMany(() => CVSkillOrmEntity, (cvSkill) => cvSkill.skill)
  cvSkills: CVSkillOrmEntity[];

  @OneToMany(() => JobSkillOrmEntity, (jobSkill) => jobSkill.skill)
  jobSkills: JobSkillOrmEntity[];
}
