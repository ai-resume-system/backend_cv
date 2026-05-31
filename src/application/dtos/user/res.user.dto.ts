import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IUserDto {
  id: string;
  email: string;
  phone?: string;
  role: EUserRole;
  status: EUserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetUserByIdResponseDto {
  id: string;
  email: string;
  phone?: string;
  role: EUserRole;
  status: EUserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    fullName?: string;
    avatarUrl?: string | null;
    bio?: string;
  };
  company?: {
    id: string;
    careerCategoryId?: string;
    name?: string;
    taxCode?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    address?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    websiteUrl?: string;
    employeeMin?: number;
    employeeMax?: number;
  };
}

export interface IResponseListApiUserDto extends IApiResponse<IUserDto[]> {}
