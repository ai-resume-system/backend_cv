export interface IJobSkillEntity {
  id: string;
  jobId: string;
  skillId: string;
  weight?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
