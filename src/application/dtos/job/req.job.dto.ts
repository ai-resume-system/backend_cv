import { IApiRequestPagination } from 'src/common/interface/api-request.interface';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';

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

export interface ICreateJobBaseDto {
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
