import { ICVParsedDataEntity } from '../entities/cv-parsed-data.entity';

export interface ICVParsedDataRepository {
  findById(id: string): Promise<ICVParsedDataEntity | null>;
  findByCvId(cvId: string): Promise<ICVParsedDataEntity | null>;
  create(
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity>;
  update(
    id: string,
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity>;
  delete(id: string): Promise<void>;
}
