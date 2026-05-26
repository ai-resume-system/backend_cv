import { IJobSkillEntity } from '../entities/job-skill.entity';

export interface IJobSkillRepository {
  findById(id: string): Promise<IJobSkillEntity | null>;
  findByJobId(jobId: string): Promise<IJobSkillEntity[]>;
  findByJobIds(jobIds: string[]): Promise<IJobSkillEntity[]>;
  findBySkillId(skillId: string): Promise<IJobSkillEntity[]>;
  create(jobSkill: Partial<IJobSkillEntity>): Promise<IJobSkillEntity>;
  delete(id: string): Promise<void>;
  deleteByJobId(jobId: string): Promise<void>;
}
