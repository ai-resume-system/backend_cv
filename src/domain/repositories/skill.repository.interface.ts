import { ISkillEntity } from '../entities/skill.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ISkillRepository extends IBaseRepository<ISkillEntity> {
  findById(id: string): Promise<ISkillEntity | null>;
  findByCareerCategoryId(careerCategoryId: string): Promise<ISkillEntity[]>;
  findByName(name: string): Promise<ISkillEntity | null>;
}
