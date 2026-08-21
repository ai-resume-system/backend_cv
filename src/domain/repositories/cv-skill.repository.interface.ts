import { ICVSkillEntity } from '../entities/cv-skill.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVSkillRepository extends IBaseRepository<ICVSkillEntity> {
  findByCvId(cvId: string): Promise<ICVSkillEntity[]>; // Tìm CV theo ID
  findBySkillId(skillId: string): Promise<ICVSkillEntity[]>; // Tìm kỹ năng theo ID
  deleteByCvId(cvId: string): Promise<void>; // Xoá CV theo ID
}
