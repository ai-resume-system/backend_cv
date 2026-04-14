import { ICompanyEntity } from '../entities/company.entity';

export interface ICompanyRepository {
  findByUserId(userId: string): Promise<ICompanyEntity | null>;
  create(company: Partial<ICompanyEntity>): Promise<ICompanyEntity>;
  update(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity>;
}
