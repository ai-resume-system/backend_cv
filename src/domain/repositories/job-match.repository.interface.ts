import { IJobMatchEntity } from '../entities/job-match.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IJobMatchRepository extends IBaseRepository<IJobMatchEntity> {
  findByCvId(cvId: string): Promise<IJobMatchEntity[]>;
  findByJobId(jobId: string): Promise<IJobMatchEntity[]>;
  findByCvIdAndJobId(
    cvId: string,
    jobId: string,
  ): Promise<IJobMatchEntity | null>;
  deleteByCvIds(cvIds: string[]): Promise<void>;
}
