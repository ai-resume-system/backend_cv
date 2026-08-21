import { IApiResponse } from 'src/common/interface/api-response.interface';
import {
  EJobStatus,
} from 'src/common/constants/enum/job.enum';
import { EUserRole } from 'src/common/constants/enum/user.enum';

export interface IAdminOverviewDto {
  totalUsers: number;
  totalRecruiters: number;
  totalJobSeekers: number;
  totalJobs: number;
  totalOpenJobs: number;
  totalPendingJobs: number;
  totalApplications: number;
}

export interface IAdminGrowthItemDto {
  bucket: string;
  total: number;
}

export interface IAdminRecentActivityDto {
  id: string;
  type: 'user_registered' | 'job_created' | 'job_reviewed' | 'application_created';
  title: string;
  description: string;
  occurredAt: Date;
  metadata?: {
    role?: EUserRole;
    status?: EJobStatus | string;
    jobId?: string;
  };
}

export interface IResponseApiAdminOverviewDto
  extends IApiResponse<IAdminOverviewDto> {}

export interface IResponseApiAdminGrowthDto
  extends IApiResponse<IAdminGrowthItemDto[]> {}

export interface IResponseApiAdminRecentActivityDto
  extends IApiResponse<IAdminRecentActivityDto[]> {}
