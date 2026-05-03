import { EApplicationStatus } from 'src/common/constants/enum/application.enum';

export interface IApplicationEntity {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  matchingScore?: number;
  notes?: string;
  status: EApplicationStatus;
  // scheduleTime?: Date;
  // scheduleLocation?: string;
  // scheduleLink?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
