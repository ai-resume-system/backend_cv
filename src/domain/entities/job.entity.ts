import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';

export interface IJobCompanyEntity {
  id: string;
  companyName?: string;
  logoUrl?: string;
  location?: string;
  websiteUrl?: string;
}

export interface IJobCareerCategoryEntity {
  id: string;
  name?: string;
  slug?: string;
}

export interface IJobEntity {
  id: string;
  companyId: string;
  careerCategoryId?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  jobType: EJobType;
  expiredAt?: Date;
  rejectReason?: string;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  company?: IJobCompanyEntity;
  careerCategory?: IJobCareerCategoryEntity;
}
