import { EUserStatus, EUserRole } from 'src/common/constants/enum/user.enum';
import { IUserEntity, IUserWithPasswordEntity } from '../entities/user.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICreateUserDto {
  email: string;
  phone?: string;
  password: string;
  role: EUserRole;
  status: EUserStatus;
}

export interface IUserRepository extends IBaseRepository<IUserEntity> {
  countAnalyticsSummary(): Promise<{
    totalUsers: number;
    totalRecruiters: number;
    totalJobSeekers: number;
  }>;
  getUserGrowthSeries(
    startDate: Date,
    endDate: Date,
    bucket: 'day' | 'month' | 'quarter',
  ): Promise<Array<{ bucket: string; total: number }>>;
  getRecentRegisteredUsers(
    limit: number,
  ): Promise<
    Array<{ id: string; email: string; role: EUserRole; createdAt: Date }>
  >;
  findByIds(ids: string[]): Promise<IUserEntity[]>;
  findByEmail(email: string): Promise<IUserEntity | null>;
  findByEmailWithPassword(
    email: string,
  ): Promise<IUserWithPasswordEntity | null>;
  findByIdWithPassword(id: string): Promise<IUserWithPasswordEntity | null>;
  createWithPassword(data: ICreateUserDto): Promise<IUserEntity>;
  updateStatus(id: string, status: EUserStatus): Promise<void>;
  updatePassword(id: string, password: string): Promise<void>;
  updateProfile(id: string, data: { phone?: string }): Promise<IUserEntity>;
}
