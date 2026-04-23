import { ICompanyEntity } from '../entities/company.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICompanyRepository extends IBaseRepository<ICompanyEntity> {
  findById(id: string): Promise<ICompanyEntity | null>;
  findByUserId(userId: string): Promise<ICompanyEntity | null>;
  updateWithUserId(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity>;
}
