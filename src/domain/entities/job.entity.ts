import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';

export interface IJobEntity {
  id: string;
  companyId: string;
  careerCategoryId?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  address?: string; // địa chỉ đầy đủ để hiển thị
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  vacancyCount?: number; // số lượng người/vị trí cần tuyển
  jobType: EJobType;
  status: EJobStatus;
  expiredAt?: Date;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
