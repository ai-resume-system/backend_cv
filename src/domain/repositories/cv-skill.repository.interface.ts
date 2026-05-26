import { ICVSkillEntity } from '../entities/cv-skill.entity';

export interface ICVSkillRepository {
  findById(id: string): Promise<ICVSkillEntity | null>;
  findByCvId(cvId: string): Promise<ICVSkillEntity[]>;
  findBySkillId(skillId: string): Promise<ICVSkillEntity[]>;
  create(cvSkill: Partial<ICVSkillEntity>): Promise<ICVSkillEntity>;
  delete(id: string): Promise<void>;
  deleteByCvId(cvId: string): Promise<void>;
}
