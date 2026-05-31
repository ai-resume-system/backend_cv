import { IUserProfileEntity } from '../entities/user_profile.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IUserProfileRepository extends IBaseRepository<IUserProfileEntity> {
  findByUserId(userId: string): Promise<IUserProfileEntity | null>; // Tìm theo user id
  updateWithUserId(
    userId: string,
    data: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity>; // Update theo user id
}
