import { EUserStatus } from 'src/common/constants/enum/user.enum';

export interface IRoleEntity {
  id: string;
  roleName: string;
  status: EUserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
