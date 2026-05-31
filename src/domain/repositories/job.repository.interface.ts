import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface IJobRepository
  extends IBaseRepository<IJobEntity>, ISlugRepository<IJobEntity> {
  findExpiredJobs(): Promise<IJobEntity[]>; // Tìm các job đã hết hạn
  findByCompanyId(companyId: string): Promise<IJobEntity[]>; // Tìm các job theo company id
  findByCareerCategoryId(careerCategoryId: string): Promise<IJobEntity[]>; // Tìm các job theo category id
  countOpenJobsByCompanyIds(
    companyIds: string[],
  ): Promise<Record<string, number>>; // Đếm số job còn hạn của mỗi company
}
