import { ISkillEntity } from '../entities/skill.entity';
import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface ISkillRepository
  extends IBaseRepository<ISkillEntity>, ISlugRepository<ISkillEntity> {
  findWithDeleted(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ISkillEntity>>;
  findAll(options?: Omit<IFindOptions, 'pagination'>): Promise<ISkillEntity[]>;
  findAllWithDeleted(
    options?: Omit<IFindOptions, 'pagination'>,
  ): Promise<ISkillEntity[]>;
  findByIds(ids: string[]): Promise<ISkillEntity[]>;
  findByCareerCategoryId(careerCategoryId: string): Promise<ISkillEntity[]>;
  findByName(name: string): Promise<ISkillEntity | null>;
  findByNameWithDeleted(name: string): Promise<ISkillEntity | null>;
  findBySlugWithDeleted(slug: string): Promise<ISkillEntity | null>;
  findBySlugs(slugs: string[]): Promise<ISkillEntity[]>;
}
