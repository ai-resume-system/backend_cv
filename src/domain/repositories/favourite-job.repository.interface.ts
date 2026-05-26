import { IFavouriteJobEntity } from '../entities/favourite-job.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IFavouriteJobRepository extends IBaseRepository<IFavouriteJobEntity> {
  findById(id: string): Promise<IFavouriteJobEntity | null>;
  findByUserIdAndJobId(
    userId: string,
    jobId: string,
  ): Promise<IFavouriteJobEntity | null>;
  existsByUserIdAndJobId(userId: string, jobId: string): Promise<boolean>;
  softDeleteByUserIdAndJobId(userId: string, jobId: string): Promise<void>;
  deleteByUserIdAndJobId(userId: string, jobId: string): Promise<void>;
  findJobIdsByUserId(userId: string): Promise<string[]>;
}
