import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface IJobRepository
  extends IBaseRepository<IJobEntity>, ISlugRepository<IJobEntity> {
  findExpiredJobs(): Promise<IJobEntity[]>;
  findByCompanyId(companyId: string): Promise<IJobEntity[]>;
  findByCareerCategoryId(careerCategoryId: string): Promise<IJobEntity[]>;
  countOpenJobsByCompanyIds(
    companyIds: string[],
  ): Promise<Record<string, number>>;
}
