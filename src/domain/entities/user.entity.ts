import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { IRoleEntity } from './role.entity';

export interface IUserEntity {
  id: string;
  email: string;
  phone?: string;
  password: string;
  status: EUserStatus;
  role_id: string;
  role?: IRoleEntity;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
