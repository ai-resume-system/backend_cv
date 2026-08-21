import {
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';

export interface IJobEntity {
  id: string;
  companyId: string;
  careerCategoryId?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  vacancyCount?: number;
  jobType: EJobType;
  educationLevel: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  status: EJobStatus;
  expiredAt?: Date;
  rejectReason?: string;
  closeReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
