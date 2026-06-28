import {
  EInterviewStatus,
  EJobApplicationStatus,
} from 'src/common/constants/enum/job-application.enum';
import { IJobApplicationEntity } from '../entities/job-application.entity';
import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from './base.repository.interface';

export interface IJobApplicationRepository
  extends IBaseRepository<IJobApplicationEntity> {
  countAnalyticsSummary(): Promise<{
    totalApplications: number;
  }>;
  getApplicationGrowthSeries(
    startDate: Date,
    endDate: Date,
    bucket: 'day' | 'month' | 'quarter',
  ): Promise<Array<{ bucket: string; total: number }>>;
  getRecentApplications(
    limit: number,
  ): Promise<
    Array<{
      id: string;
      fullName: string;
      contactEmail: string;
      jobId: string;
      createdAt: Date;
    }>
  >;
  findByJobId(jobId: string): Promise<IJobApplicationEntity[]>;
  findByUserId(userId: string): Promise<IJobApplicationEntity[]>;
  findByCvId(cvId: string): Promise<IJobApplicationEntity[]>;
  findActiveByCvId(cvId: string): Promise<IJobApplicationEntity[]>;
  findByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<IJobApplicationEntity | null>;
  hasActiveApplication(jobId: string, userId: string): Promise<boolean>;
  updateStatus(
    id: string,
    status: EJobApplicationStatus,
    data?: Partial<IJobApplicationEntity>,
  ): Promise<IJobApplicationEntity>;
  updateInterviewStatus(
    id: string,
    interviewStatus: EInterviewStatus,
  ): Promise<IJobApplicationEntity>;
  findByCompanyId(
    companyId: string,
    options?: IFindOptions,
  ): Promise<IPaginatedResult<IJobApplicationEntity>>;
}
