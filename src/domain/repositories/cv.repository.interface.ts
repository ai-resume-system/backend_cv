import { ICVEntity } from '../entities/cv.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVRepository extends IBaseRepository<ICVEntity> {
  findByIds(ids: string[]): Promise<ICVEntity[]>;
  findByUserId(userId: string): Promise<ICVEntity[]>;
  countByUserId(userId: string): Promise<number>;
  findDefaultByUserId(userId: string): Promise<ICVEntity | null>;
  findSoftDeletedBefore(before: Date): Promise<ICVEntity[]>;
  unsetDefault(id: string, userId: string): Promise<ICVEntity>;
  setDefault(id: string, userId: string): Promise<ICVEntity>;
}
