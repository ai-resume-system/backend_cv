import { ICVParsedDataEntity } from '../entities/cv-parsed-data.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVParsedDataRepository
  extends IBaseRepository<ICVParsedDataEntity> {
  findByCvId(cvId: string): Promise<ICVParsedDataEntity | null>;
  findLatestByCvId(cvId: string): Promise<ICVParsedDataEntity | null>;
  findLatestByCvIds(cvIds: string[]): Promise<ICVParsedDataEntity[]>;
  create(
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity>;
  update(
    id: string,
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity>;
}
