import { IJobSkillEntity } from '../entities/job-skill.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IJobSkillRepository extends IBaseRepository<IJobSkillEntity> {
  findByJobId(jobId: string): Promise<IJobSkillEntity[]>; // Tìm các job-skill theo job id
  findByJobIdWithDeleted(jobId: string): Promise<IJobSkillEntity[]>; // Tìm cả job-skill đã soft delete theo job id
  findByJobIds(jobIds: string[]): Promise<IJobSkillEntity[]>; // Tìm các job-skill theo job id
  findBySkillId(skillId: string): Promise<IJobSkillEntity[]>; // Tìm các job-skill theo skill id
  deleteByJobId(jobId: string): Promise<void>; // Xóa job-skill theo job id
}
