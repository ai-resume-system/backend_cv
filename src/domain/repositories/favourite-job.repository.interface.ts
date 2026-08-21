import { IFavouriteJobEntity } from '../entities/favourite-job.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IFavouriteJobRepository extends IBaseRepository<IFavouriteJobEntity> {
  findByUserIdAndJobId(
    userId: string,
    jobId: string,
  ): Promise<IFavouriteJobEntity | null>; // Tìm job yêu thích của user
  existsByUserIdAndJobId(userId: string, jobId: string): Promise<boolean>; // Kiểm tra xem danh sách tồn tại chưa
  deleteByUserIdAndJobId(userId: string, jobId: string): Promise<void>; // Xóa danh sách yêu thích
  findJobIdsByUserId(userId: string): Promise<string[]>; // Tìm job yêu thích của user theo userId
}
