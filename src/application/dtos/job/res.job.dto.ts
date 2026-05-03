import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IJobResponseDto {
  id: string;
  companyId: string;
  careerCategoryId?: string;
  title: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  jobType: EJobType;
  expiredAt?: Date;
  rejectReason?: string;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IResponseApiJobDto extends IApiResponse<IJobResponseDto> {}

export interface IResponseListApiJobDto extends IApiResponse<
  IJobResponseDto[]
> {}
