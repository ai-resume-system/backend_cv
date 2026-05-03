import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IJobRepository extends IBaseRepository<IJobEntity> {
  findByCompanyId(companyId: string): Promise<IJobEntity[]>;
}
