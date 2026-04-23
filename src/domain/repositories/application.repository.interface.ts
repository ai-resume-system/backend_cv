import { IApplicationEntity } from '../entities/application.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IApplicationRepository extends IBaseRepository<IApplicationEntity> {
  findById(id: string): Promise<IApplicationEntity | null>;
  findByJobId(jobId: string): Promise<IApplicationEntity[]>;
  findByUserId(userId: string): Promise<IApplicationEntity[]>;
  findByCvId(cvId: string): Promise<IApplicationEntity[]>;
  findByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<IApplicationEntity | null>;
}
