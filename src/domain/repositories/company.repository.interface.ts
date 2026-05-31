import { ICompanyEntity } from '../entities/company.entity';
import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface ICompanyRepository
  extends IBaseRepository<ICompanyEntity>, ISlugRepository<ICompanyEntity> {
  findByIds(ids: string[]): Promise<ICompanyEntity[]>; // Tìm các công ty theo id
  findPublic(options?: IFindOptions): Promise<IPaginatedResult<ICompanyEntity>>; // Tìm các công ty công khai
  findPublicByIds(ids: string[]): Promise<ICompanyEntity[]>; // Tìm các công ty công khai theo id
  findPublicBySlug(slug: string): Promise<ICompanyEntity | null>; // Tìm công ty công khai theo slug
  findByCareerCategoryId(careerCategoryId: string): Promise<ICompanyEntity[]>; // Tìm các công ty theo career category id
  findByUserId(userId: string): Promise<ICompanyEntity | null>; // Tìm công ty theo user id
  updateWithUserId(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity>; // Update công ty theo user id
}
