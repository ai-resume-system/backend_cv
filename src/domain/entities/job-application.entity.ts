import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

export interface IJobApplicationEntity {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  fullName?: string;
  contactEmail?: string;
  contactPhone?: string;
  coverLetter?: string;
  matchingScore: number;
  notes?: string;
  status: EJobApplicationStatus;
  scheduleTime?: Date;
  scheduleLocation?: string;
  scheduleLink?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
