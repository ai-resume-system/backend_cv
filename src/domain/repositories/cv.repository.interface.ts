import { ICVEntity } from '../entities/cv.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVRepository extends IBaseRepository<ICVEntity> {
  findById(id: string): Promise<ICVEntity | null>;
  findByUserId(userId: string): Promise<ICVEntity[]>;
}
