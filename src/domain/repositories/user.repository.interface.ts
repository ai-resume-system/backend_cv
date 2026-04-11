import { IUserEntity } from '../entities/user.entity';
import { EUserStatus } from 'src/common/constants/enum/user.enum';

export interface IUserRepository {
  findById(id: string): Promise<IUserEntity | null>;
  findByIdWithRole(id: string): Promise<IUserEntity | null>;
  findByEmail(email: string): Promise<IUserEntity | null>;
  findByEmailWithPassword(email: string): Promise<IUserEntity | null>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ data: IUserEntity[]; total: number }>;
  create(user: Partial<IUserEntity>): Promise<IUserEntity>;
  update(id: string, user: Partial<IUserEntity>): Promise<IUserEntity>;
  updateStatus(id: string, status: EUserStatus): Promise<void>;
  updatePassword(id: string, password: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}
