import { IFavouriteJobEntity } from '../entities/favourite-job.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IFavouriteJobRepository extends IBaseRepository<IFavouriteJobEntity> {
  findById(id: string): Promise<IFavouriteJobEntity | null>;
}
