import { ICareerCategoryEntity } from '../entities/career-category.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICareerCategoryRepository extends IBaseRepository<ICareerCategoryEntity> {
  findByName(name: string): Promise<ICareerCategoryEntity | null>;
  findBySlug(slug: string): Promise<ICareerCategoryEntity | null>;
}
