import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IApplicationCVResponse {
  id: string;
  title?: string;
  fileUrl?: string;
  summary?: string;
  status: string;
  processingStatus?: string;
  createdAt: Date;
}

export interface IJobApplicationResponseDto {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  fullName?: string;
  contactEmail?: string;
  contactPhone?: string;
  coverLetter?: string;
  matchingScore?: number;
  notes?: string;
  status: EJobApplicationStatus;
  scheduleTime?: Date;
  scheduleLocation?: string;
  scheduleLink?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  cv?: {
    id: string;
    title?: string;
    fileUrl?: string;
    summary?: string;
  };
  job?: {
    id: string;
    title: string;
    location?: string;
    company?: {
      id: string;
      companyName?: string;
      logoUrl?: string | null;
    };
  };
  user?: {
    id: string;
    email: string;
    phone?: string;
  };
}

export interface IResponseApiJobApplicationDto extends IApiResponse<IJobApplicationResponseDto> {}

export interface IResponseListApiJobApplicationDto extends IApiResponse<
  IJobApplicationResponseDto[]
> {}
