import { ICVEntity } from '../entities/cv.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVRepository extends IBaseRepository<ICVEntity> {
  findByUserId(userId: string): Promise<ICVEntity[]>;
  countByUserId(userId: string): Promise<number>;
  findDefaultByUserId(userId: string): Promise<ICVEntity | null>;
  unsetDefault(id: string, userId: string): Promise<ICVEntity>;
  setDefault(id: string, userId: string): Promise<ICVEntity>;
}
