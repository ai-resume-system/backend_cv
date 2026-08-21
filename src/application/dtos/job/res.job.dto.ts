import {
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IPublicJobCompanyDto {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  websiteUrl?: string;
  taxCode?: string;
  employeeMin?: number;
  employeeMax?: number;
}

export interface IJobCareerCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface IJobSkillDto {
  id: string;
  name: string;
  slug: string;
  weight?: number;
}

export interface IPublicJobDto {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  vacancyCount?: number;
  experienceYears?: number;
  expiredAt?: Date;
  jobType: EJobType;
  educationLevel: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  company: IPublicJobCompanyDto;
  careerCategory?: IJobCareerCategoryDto;
  skills?: IJobSkillDto[];
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;
  isFavourited?: boolean;
}

export interface IManagedJobDto extends Omit<IPublicJobDto, 'isFavourited'> {
  rejectReason?: string;
  closeReason?: string;
}

export type IPublicJobItemDto = IPublicJobDto;
export type IPublicJobDetailDto = IPublicJobDto;
export type IRecruiterJobItemDto = IManagedJobDto;
export type IRecruiterJobDetailDto = IManagedJobDto;
export type IAdminJobItemDto = IManagedJobDto;
export type IAdminJobDetailDto = IManagedJobDto;

export interface IResponseApiPublicJobDto
  extends IApiResponse<IPublicJobDetailDto> {}

export interface IResponseListApiPublicJobDto
  extends IApiResponse<IPublicJobItemDto[]> {}

export interface IResponseApiManagedJobDto
  extends IApiResponse<IManagedJobDto> {}

export interface IResponseListApiManagedJobDto
  extends IApiResponse<IManagedJobDto[]> {}

export interface IResponseApiRecruiterJobDto
  extends IResponseApiManagedJobDto {}

export interface IResponseListApiRecruiterJobDto
  extends IResponseListApiManagedJobDto {}

export interface IResponseApiAdminJobDto extends IResponseApiManagedJobDto {}

export interface IResponseListApiAdminJobDto
  extends IResponseListApiManagedJobDto {}

export interface IJobMatchBreakdownDto {
  skillMatch: number;
  careerCategoryMatch: number;
  experienceMatch: number;
  titleKeywordSimilarity: number;
}

export interface IJobMatchSkillEvidenceDto {
  name: string;
  normalizedName: string;
  systemSkillSlug?: string;
  confidence?: number;
}

export interface IJobMatchResultDto {
  cvId: string;
  jobId: string;
  jobSlug: string;
  matchScore: number;
  breakdown: IJobMatchBreakdownDto;
  matchedSkills: IJobMatchSkillEvidenceDto[];
  missingSkills: IJobSkillDto[];
  strengths: string[];
  risks: string[];
  improvementSuggestions: string[];
  computedAt: Date;
}

export interface IResponseApiJobMatchDto
  extends IApiResponse<IJobMatchResultDto> {}

export interface IResponseApiJobMatchOrEmptyDto
  extends IApiResponse<IJobMatchResultDto | []> {}
