import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';

export interface IJobEntity {
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
