import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IApplicationCVResponse {
  id: string;
  title?: string;
  fileUrl?: string;
  summary?: string;
  status?: string;
  processingStatus?: string;
  createdAt?: Date;
}

export interface IApplicationJobCompanyResponse {
  id: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
}

export interface IApplicationJobResponse {
  id: string;
  slug: string;
  title: string;
  address?: string;
  company?: IApplicationJobCompanyResponse;
}

export interface IApplicationUserResponse {
  id: string;
  email: string;
  phone?: string;
}

export interface IJobApplicationBaseDto {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  fullName?: string;
  contactEmail?: string;
  contactPhone?: string;
  coverLetter?: string;
  matchingScore?: number;
  status: EJobApplicationStatus;
  scheduleTime?: Date;
  scheduleLocation?: string;
  scheduleLink?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  cv?: IApplicationCVResponse;
  job?: IApplicationJobResponse;
}

export interface IJobSeekerJobApplicationDto extends IJobApplicationBaseDto {}

export interface IRecruiterJobApplicationDto extends IJobApplicationBaseDto {
  notes?: string;
  user?: IApplicationUserResponse;
}

export interface IResponseApiJobSeekerJobApplicationDto extends IApiResponse<IJobSeekerJobApplicationDto> {}

export interface IResponseListApiJobSeekerJobApplicationDto extends IApiResponse<
  IJobSeekerJobApplicationDto[]
> {}

export interface IResponseApiRecruiterJobApplicationDto extends IApiResponse<IRecruiterJobApplicationDto> {}

export interface IResponseListApiRecruiterJobApplicationDto extends IApiResponse<
  IRecruiterJobApplicationDto[]
> {}
