import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { IJobApplicationEntity } from '../entities/job-application.entity';
import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from './base.repository.interface';

export interface IJobApplicationRepository
  extends IBaseRepository<IJobApplicationEntity> {
  findByJobId(jobId: string): Promise<IJobApplicationEntity[]>;
  findByUserId(userId: string): Promise<IJobApplicationEntity[]>;
  findByCvId(cvId: string): Promise<IJobApplicationEntity[]>;
  findActiveByCvId(cvId: string): Promise<IJobApplicationEntity[]>;
  findByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<IJobApplicationEntity | null>;
  hasActiveApplication(jobId: string, userId: string): Promise<boolean>;
  updateStatus(
    id: string,
    status: EJobApplicationStatus,
    data?: Partial<IJobApplicationEntity>,
  ): Promise<IJobApplicationEntity>;
  findByCompanyId(
    companyId: string,
    options?: IFindOptions,
  ): Promise<IPaginatedResult<IJobApplicationEntity>>;
}
