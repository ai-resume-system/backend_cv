import { IApiRequestPagination } from 'src/common/interface/api-request.interface';
import {
  EJobAction,
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';

export interface IGetJobsDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  address?: string;
  companyId?: string;
  companySlug?: string;
  skillIds?: string[];
  skillSlugs?: string[];
  salaryMin?: number;
  salaryMax?: number;
  experienceYearsMin?: number;
  experienceYearsMax?: number;
  jobType?: EJobType;
  educationLevel?: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  careerCategorySlug?: string;
  careerCategoryId?: string;
  status?: EJobStatus;
}

export interface IGetRelatedJobsDto {
  limit?: number;
}

export interface IGetJobMatchDto {
  cvId: string;
}

export interface ICalculateJobMatchDto {
  cvId: string;
}

export interface IJobSkillInputDto {
  skillId: string;
  weight?: number;
}

export interface ICreateJobBaseDto {
  action?: EJobAction;
  careerCategoryId?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  vacancyCount?: number;
  expiredAt?: Date;
  jobType?: EJobType;
  educationLevel?: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  skills?: IJobSkillInputDto[];
}

export interface ICreateJobDto extends ICreateJobBaseDto {
  companyId: string;
}

export type IUpdateJobDto = Partial<Omit<ICreateJobDto, 'companyId'>> & {
  status?: EJobStatus;
};

export interface IRejectJobDto {
  rejectReason: string;
}

export interface ICloseJobDto {
  closeReason: string;
}
