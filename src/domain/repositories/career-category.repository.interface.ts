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
  ): Promise<IPaginatedResult<ICareerCategoryEntity>>; // Tìm các danh mục nghề nghiệp đang hoạt động
  findActiveBySlug(slug: string): Promise<ICareerCategoryEntity | null>; // Tìm danh mục nghề nghiệp đang hoạt động theo slug
  findWithDeleted(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ICareerCategoryEntity>>; // Tìm các danh mục nghề nghiệp đã bị xóa
  findBySlugWithDeleted(slug: string): Promise<ICareerCategoryEntity | null>; // Tìm danh mục nghề nghiệp đã bị xóa theo slug
  findByIds(ids: string[]): Promise<ICareerCategoryEntity[]>; // Tìm các danh mục nghề nghiệp theo id
  findByName(name: string): Promise<ICareerCategoryEntity | null>; // Tìm danh mục nghề nghiệp theo tên
  findBySlugs(slugs: string[]): Promise<ICareerCategoryEntity[]>; // Tìm danh mục nghề nghiệp theo slug
  findTopCategoriesByOpenJobCount(
    limit: number,
  ): Promise<Array<{ category: ICareerCategoryEntity; jobCount: number }>>; // Tìm các danh mục nghề nghiệp theo số lượng công việc đang mở
}
