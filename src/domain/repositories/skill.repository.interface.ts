import { ISkillEntity } from '../entities/skill.entity';
import { IBaseRepository } from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface ISkillRepository
  extends IBaseRepository<ISkillEntity>, ISlugRepository<ISkillEntity> {
  findByCareerCategoryId(careerCategoryId: string): Promise<ISkillEntity[]>; // Tìm theo category id
  findByName(name: string): Promise<ISkillEntity | null>; // Tìm theo tên
  findBySlugs(slugs: string[]): Promise<ISkillEntity[]>; // Tìm theo slug
}
