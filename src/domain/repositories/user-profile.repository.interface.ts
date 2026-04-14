import { IUserProfileEntity } from '../entities/user_profile.entity';

export interface IUserProfileRepository {
  findByUserId(userId: string): Promise<IUserProfileEntity | null>;
  create(profile: Partial<IUserProfileEntity>): Promise<IUserProfileEntity>;
  update(
    userId: string,
    data: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity>;
}
