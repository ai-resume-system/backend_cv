import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

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

export interface IRequestGetJobApplicationsDto {
  page?: number;
  limit?: number;
  status?: EJobApplicationStatus;
  sortBy?: 'createdAt' | 'matchingScore';
  sortOrder?: 'ASC' | 'DESC';
}
