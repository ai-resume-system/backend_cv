import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

export interface IJobApplicationEntity {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  matchingScore?: number;
  notes?: string;
  status: EJobApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
