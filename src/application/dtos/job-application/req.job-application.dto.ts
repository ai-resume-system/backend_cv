import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

export interface IRequestCreateJobApplicationDto {
  cvId: string;
  jobId: string;
}

export interface IRequestUpdateJobApplicationStatusDto {
  status: EJobApplicationStatus;
}
