import { ISkillEntity } from '../entities/skill.entity';
import { IBaseRepository } from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface ISkillRepository
  extends IBaseRepository<ISkillEntity>, ISlugRepository<ISkillEntity> {
  findByIds(ids: string[]): Promise<ISkillEntity[]>;
  findByCareerCategoryId(careerCategoryId: string): Promise<ISkillEntity[]>;
  findByName(name: string): Promise<ISkillEntity | null>;
  findBySlugs(slugs: string[]): Promise<ISkillEntity[]>;
}
