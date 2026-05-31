import { ICVParsedDataEntity } from '../entities/cv-parsed-data.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICVParsedDataRepository extends IBaseRepository<ICVParsedDataEntity> {
  findByCvId(cvId: string): Promise<ICVParsedDataEntity | null>; // Tìm theo CV id
  create(
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity>; // Tạo thông tin parsed CV
  update(
    id: string,
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity>; // Cập nhật thông tin parsed CV
}
