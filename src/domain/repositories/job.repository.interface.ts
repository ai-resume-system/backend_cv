import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';
import { ISlugRepository } from './slug.repository.interface';

export interface IFindRelatedJobsOptions {
  excludedJobId: string;
  excludedJobIds?: string[];
  limit: number;
  careerCategoryId?: string;
  skillIds?: string[];
}

export interface IJobAnalyticsSummary {
  totalJobs: number;
  totalOpenJobs: number;
  totalPendingJobs: number;
}

export interface IRecruiterDashboardJobSummary {
  totalJobs: number;
  openJobs: number;
}

export interface IRecentJobActivity {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobRepository
  extends IBaseRepository<IJobEntity>, ISlugRepository<IJobEntity> {
  countAnalyticsSummary(): Promise<IJobAnalyticsSummary>;
  countRecruiterDashboardJobSummary(
    companyId: string,
  ): Promise<IRecruiterDashboardJobSummary>;
  getJobGrowthSeries(
    startDate: Date,
    endDate: Date,
    bucket: 'day' | 'month' | 'quarter',
  ): Promise<Array<{ bucket: string; total: number }>>;
  getRecentCreatedJobs(limit: number): Promise<IRecentJobActivity[]>;
  getRecentReviewedJobs(limit: number): Promise<IRecentJobActivity[]>;
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
