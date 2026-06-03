import { EJobType } from 'src/common/constants/enum/job.enum';
import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface IFindRelatedJobsOptions {
  excludedJobId: string;
  excludedJobIds?: string[];
  limit: number;
  careerCategoryId?: string;
  address?: string;
  jobType?: EJobType;
  skillIds?: string[];
}

export interface IJobRepository
  extends IBaseRepository<IJobEntity>, ISlugRepository<IJobEntity> {
  findExpiredJobs(): Promise<IJobEntity[]>;
  findByIds(ids: string[]): Promise<IJobEntity[]>;
  findByCompanyId(companyId: string): Promise<IJobEntity[]>;
  findByCareerCategoryId(careerCategoryId: string): Promise<IJobEntity[]>;
  countOpenJobsByCompanyIds(
    companyIds: string[],
  ): Promise<Record<string, number>>;
  findPublicRelatedJobs(
    options: IFindRelatedJobsOptions,
  ): Promise<IJobEntity[]>;
}
