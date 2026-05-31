import { ICompanyEntity } from '../entities/company.entity';
import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface ICompanyRepository
  extends IBaseRepository<ICompanyEntity>, ISlugRepository<ICompanyEntity> {
  findByIds(ids: string[]): Promise<ICompanyEntity[]>;
  findPublic(options?: IFindOptions): Promise<IPaginatedResult<ICompanyEntity>>;
  findPublicByIds(ids: string[]): Promise<ICompanyEntity[]>;
  findPublicBySlug(slug: string): Promise<ICompanyEntity | null>;
  findByCareerCategoryId(careerCategoryId: string): Promise<ICompanyEntity[]>;
  findByUserId(userId: string): Promise<ICompanyEntity | null>;
  updateWithUserId(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity>;
}
