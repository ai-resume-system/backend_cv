import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
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
  notes?: string;
  scheduleTime?: Date;
  scheduleLocation?: string;
  scheduleLink?: string;
}

export interface IRequestGetJobApplicationsDto extends IApiRequestPagination {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: EJobApplicationStatus;
}
