import { IJobSkillEntity } from '../entities/job-skill.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IJobSkillRepository extends IBaseRepository<IJobSkillEntity> {
  findByJobId(jobId: string): Promise<IJobSkillEntity[]>;
  findByJobIds(jobIds: string[]): Promise<IJobSkillEntity[]>;
  findBySkillId(skillId: string): Promise<IJobSkillEntity[]>;
  create(jobSkill: Partial<IJobSkillEntity>): Promise<IJobSkillEntity>;
  deleteByJobId(jobId: string): Promise<void>;
}
