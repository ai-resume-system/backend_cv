import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IJobCompanyDto {
  id: string;
  companyName?: string;
  logoUrl?: string | null;
  location?: string;
  websiteUrl?: string;
}

export interface IJobCareerCategoryDto {
  id: string;
  name?: string;
  slug?: string;
}

export interface IJobSkillDto {
  id: string;
  name: string;
  weight?: number;
}

export interface IJobResponseDto {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: Date;
  jobType: EJobType;
  rejectReason?: string;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;

  company: IJobCompanyDto;
  careerCategory?: IJobCareerCategoryDto;
  skills?: IJobSkillDto[];
  isFavourited?: boolean;
}

export interface IResponseApiJobDto extends IApiResponse<IJobResponseDto> {}

export interface IResponseListApiJobDto extends IApiResponse<
  IJobResponseDto[]
> {}
