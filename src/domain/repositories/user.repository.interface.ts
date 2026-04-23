import { EUserStatus, EUserRole } from 'src/common/constants/enum/user.enum';
import { IUserEntity, IUserWithPasswordEntity } from '../entities/user.entity';
import { IBaseRepository } from './base.repository.interface';
import { IPaginatedResult } from './base.repository.interface';

export interface ICreateUserDto {
  email: string;
  password: string;
  role: EUserRole;
  status: EUserStatus;
  phone?: string;
}

export interface IUserRepository extends IBaseRepository<IUserEntity> {
  findById(id: string): Promise<IUserEntity | null>;
  findByEmail(email: string): Promise<IUserEntity | null>;
  findByEmailWithPassword(
    email: string,
  ): Promise<IUserWithPasswordEntity | null>;
  findByIdWithPassword(id: string): Promise<IUserWithPasswordEntity | null>;
  createWithPassword(data: ICreateUserDto): Promise<IUserEntity>;
  updateStatus(id: string, status: EUserStatus): Promise<void>;
  updatePassword(id: string, password: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  findWithPagination(params: {
    skip: number;
    take: number;
    role?: EUserRole;
    status?: EUserStatus;
  }): Promise<IPaginatedResult<IUserEntity>>;
}
