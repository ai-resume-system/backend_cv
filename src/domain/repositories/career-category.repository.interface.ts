import { ICareerCategoryEntity } from '../entities/career-category.entity';
import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface ICareerCategoryRepository
  extends
    IBaseRepository<ICareerCategoryEntity>,
    ISlugRepository<ICareerCategoryEntity> {
  findActive(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ICareerCategoryEntity>>;
  findActiveBySlug(slug: string): Promise<ICareerCategoryEntity | null>;
  findWithDeleted(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ICareerCategoryEntity>>;
  findBySlugWithDeleted(slug: string): Promise<ICareerCategoryEntity | null>;
  findByIds(ids: string[]): Promise<ICareerCategoryEntity[]>;
  findByName(name: string): Promise<ICareerCategoryEntity | null>;
  findBySlugs(slugs: string[]): Promise<ICareerCategoryEntity[]>;
  findTopCategoriesByOpenJobCount(
    limit: number,
  ): Promise<Array<{ category: ICareerCategoryEntity; jobCount: number }>>;
}
