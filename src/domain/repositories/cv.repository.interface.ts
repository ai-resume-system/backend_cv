import { ICVEntity } from '../entities/cv.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVRepository extends IBaseRepository<ICVEntity> {
  findById(id: string): Promise<ICVEntity | null>;
  findByUserId(userId: string): Promise<ICVEntity[]>;
  countByUserId(userId: string): Promise<number>;
  findDefaultByUserId(userId: string): Promise<ICVEntity | null>;
  unsetDefaultByUserId(userId: string): Promise<void>;
  setDefault(id: string, userId: string): Promise<ICVEntity>;
}
