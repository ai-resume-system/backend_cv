import { IUserProfileEntity } from '../entities/user_profile.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IUserProfileRepository extends IBaseRepository<IUserProfileEntity> {
  findByUserIds(userIds: string[]): Promise<IUserProfileEntity[]>;
  findByUserId(userId: string): Promise<IUserProfileEntity | null>;
  updateWithUserId(
    userId: string,
    data: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity>;
}
