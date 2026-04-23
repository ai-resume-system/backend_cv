import { IJobEntity } from '../entities/job.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IJobRepository extends IBaseRepository<IJobEntity> {
  findById(id: string): Promise<IJobEntity | null>;
  findByCompanyId(companyId: string): Promise<IJobEntity[]>;
}
