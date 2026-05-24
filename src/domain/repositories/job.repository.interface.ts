import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IJobRepository extends IBaseRepository<IJobEntity> {
  findExpiredJobs(): Promise<IJobEntity[]>;
  findByCompanyId(companyId: string): Promise<IJobEntity[]>;
}
