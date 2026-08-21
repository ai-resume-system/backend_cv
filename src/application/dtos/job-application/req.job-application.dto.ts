import {
  EInterviewStatus,
  EInterviewType,
  EJobApplicationStatus,
} from 'src/common/constants/enum/job-application.enum';
import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IRequestCreateJobApplicationDto {
  cvId: string;
  jobId: string;
  fullName: string;
  contactEmail: string;
  contactPhone: string;
  coverLetter?: string;
}

export interface IRequestUpdateJobApplicationStatusDto {
  status: EJobApplicationStatus;
  rejectionReason?: string;
  interviewType?: EInterviewType;
  interviewNotes?: string;
  onboardingNotes?: string;
  scheduleTime?: Date;
  scheduleLocation?: string;
  scheduleLink?: string;
}

export interface IRequestUpdateJobApplicationInterviewStatusDto {
  interviewStatus: EInterviewStatus;
}

export interface IRequestGetJobApplicationsDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: EJobApplicationStatus;
}

export interface IRequestGetRecruiterJobApplicationsDto extends IApiRequestPagination {
  q?: string;
  jobId?: string;
  status?: EJobApplicationStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IRequestGetRecruiterNewApplicantsDto {
  limit?: number;
  jobId?: string;
}

export interface IRequestGetRecruiterInterviewsDto extends IApiRequestPagination {
  from?: Date;
  to?: Date;
  jobId?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
