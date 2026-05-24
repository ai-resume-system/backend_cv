import { IJobMatchEntity } from '../entities/job-match.entity';

export interface IJobMatchRepository {
  findById(id: string): Promise<IJobMatchEntity | null>;
  findByCvId(cvId: string): Promise<IJobMatchEntity[]>;
  findByJobId(jobId: string): Promise<IJobMatchEntity[]>;
  findByCvIdAndJobId(
    cvId: string,
    jobId: string,
  ): Promise<IJobMatchEntity | null>;
  create(jobMatch: Partial<IJobMatchEntity>): Promise<IJobMatchEntity>;
  update(
    id: string,
    jobMatch: Partial<IJobMatchEntity>,
  ): Promise<IJobMatchEntity>;
  delete(id: string): Promise<void>;
}
