import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IJobApplicationResponseDto {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  matchingScore?: number;
  notes?: string;
  status: EJobApplicationStatus;
  scheduleTime?: Date;
  scheduleLocation?: string;
  scheduleLink?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IResponseApiJobApplicationDto extends IApiResponse<IJobApplicationResponseDto> {}

export interface IResponseListApiJobApplicationDto extends IApiResponse<
  IJobApplicationResponseDto[]
> {}
