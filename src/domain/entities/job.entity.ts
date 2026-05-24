import { EJobStatus } from 'src/common/constants/enum/job.enum';

export interface IJobEntity {
  id: string;
  companyId: string;
  careerCategoryId?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: Date;
  rejectReason?: string;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
