import { IApiRequestPagination } from 'src/common/interface/api-request.interface';
import {
  EJobStatus,
  EJobType,
} from 'src/common/constants/enum/job.enum';

export interface IGetJobsDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  location?: string;
  companyId?: string;
  skillIds?: string[];
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  jobType?: EJobType;
  // public
  careerCategorySlug?: string;

  // internal/admin
  careerCategoryId?: string;
  status?: EJobStatus;
}

export interface IJobSkillInputDto {
  skillId: string;
  weight?: number;
}

export interface ICreateJobDto {
  title: string;
  description?: string;
  shortDescription?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  companyId: string;
  careerCategoryId?: string;
  expiredAt?: Date;
  jobType?: EJobType;
  skills?: IJobSkillInputDto[];
}

export interface IUpdateJobDto {
  title?: string;
  description?: string;
  shortDescription?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  careerCategoryId?: string;
  expiredAt?: Date;
  jobType?: EJobType;
  status?: EJobStatus;
  skills?: IJobSkillInputDto[];
}

export interface IRejectJobDto {
  rejectReason: string;
}
