export interface IJobMatchEntity {
  id: string;
  cvId: string;
  jobId: string;
  matchScore: number;
  matchedSkills?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
