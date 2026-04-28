export interface ICVSkillEntity {
  id: string;
  cvId: string;
  skillId: string;
  confidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
