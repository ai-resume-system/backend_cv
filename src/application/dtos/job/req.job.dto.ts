import { EJobType, EJobStatus } from '../../../common/constants/enum/job.enum';

export interface ICreateJobDto {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: EJobType;
  status?: EJobStatus;
  companyId: string;
  careerCategoryId?: string;
}

export interface IUpdateJobDto {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: EJobType;
  status?: EJobStatus;
  careerCategoryId?: string;
}

export interface IGetJobsDto {
  page?: number;
  limit?: number;
  companyId?: string;
  status?: EJobStatus;
  careerCategoryId?: string;
}

export interface IJobResponseDto {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: EJobType;
  status: EJobStatus;
  companyId: string;
  careerCategoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}
