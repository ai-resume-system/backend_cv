import { EUserStatus, EUserRole } from 'src/common/constants/enum/user.enum';
import { IUserEntity, IUserWithPasswordEntity } from '../entities/user.entity';
import { IBaseRepository } from './base.repository.interface';
import { IPaginatedResult } from './base.repository.interface';

export interface ICreateUserDto {
  email: string;
  phone?: string;
  password: string;
  role: EUserRole;
  status: EUserStatus;
}

export interface IUserRepository extends IBaseRepository<IUserEntity> {
  findByEmail(email: string): Promise<IUserEntity | null>; //tìm user theo email
  findByEmailWithPassword(
    email: string,
  ): Promise<IUserWithPasswordEntity | null>; //tìm user theo email với password
  findByIdWithPassword(id: string): Promise<IUserWithPasswordEntity | null>; //tìm user theo id với password
  createWithPassword(data: ICreateUserDto): Promise<IUserEntity>; //tạo user với password
  updateStatus(id: string, status: EUserStatus): Promise<void>; //cập nhật trạng thái của user
  updatePassword(id: string, password: string): Promise<void>; //cập nhật mật khẩu của user
  updateProfile(id: string, data: { phone?: string }): Promise<IUserEntity>; //cập nhật thông tin của user
}
