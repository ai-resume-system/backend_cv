import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IJobCompanyDto {
  id: string;
  companyName?: string;
  logoUrl?: string;
  location?: string;
  websiteUrl?: string;
}

export interface IJobCareerCategoryDto {
  id: string;
  name?: string;
  slug?: string;
}

export interface IJobResponseDto {
  id: string;
  title: string;
  shortDescription?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: Date;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;

  company: IJobCompanyDto;
  careerCategory?: IJobCareerCategoryDto;
}

export interface IResponseApiJobDto extends IApiResponse<IJobResponseDto> {}

export interface IResponseListApiJobDto extends IApiResponse<
  IJobResponseDto[]
> {}
