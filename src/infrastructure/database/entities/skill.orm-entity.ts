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

@Entity({ name: 'skills' })
@Index('idx_skills_name', ['name'], { unique: true })
@Index('idx_skills_career_category', ['careerCategoriesId'], { unique: false })
export class SkillOrmEntity implements ISkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'career_categories_id', type: 'uuid', nullable: true })
  careerCategoriesId?: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

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

  @ManyToOne(() => CareerCategoryOrmEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'career_categories_id' })
  careerCategory?: CareerCategoryOrmEntity;

  @ManyToOne(() => SkillOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: SkillOrmEntity;

  @OneToMany(() => CVSkillOrmEntity, (cvSkill) => cvSkill.skill)
  cvSkills: CVSkillOrmEntity[];
}
