import { EUserStatus, EUserRole } from 'src/common/constants/enum/user.enum';

export interface IUserEntity {
  id: string;
  email: string;
  phone?: string;
  password: string;
  status: EUserStatus;
  role: EUserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
