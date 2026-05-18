import type { ICVSkillEntity } from 'src/domain/entities/cv-skill.entity';
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
import { CVOrmEntity } from './cv.orm-entity';
import { SkillOrmEntity } from './skill.orm-entity';

@Entity({ name: 'cv_skills' })
@Index('idx_cv_skills_cv_id', ['cvId'], { unique: false })
@Index('idx_cv_skills_skill_id', ['skillId'], { unique: false })
@Index('idx_cv_skills_cv_skill', ['cvId', 'skillId'], { unique: true })
export class CVSkillOrmEntity implements ICVSkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cv_id', type: 'uuid' })
  cvId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @Column({
    name: 'confidence_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  confidenceScore?: number;

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

  @ManyToOne(() => CVOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cv_id' })
  cv: CVOrmEntity;

  @ManyToOne(() => SkillOrmEntity, (skill) => skill.cvSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillOrmEntity;
}
