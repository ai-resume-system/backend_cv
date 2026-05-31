import { ICVSkillEntity } from '../entities/cv-skill.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVSkillRepository extends IBaseRepository<ICVSkillEntity> {
  findByCvId(cvId: string): Promise<ICVSkillEntity[]>;
  findBySkillId(skillId: string): Promise<ICVSkillEntity[]>;
  create(cvSkill: Partial<ICVSkillEntity>): Promise<ICVSkillEntity>;
  deleteByCvId(cvId: string): Promise<void>;
}
