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
    avatarUrl?: string;
    bio?: string;
  };
  company?: {
    id: string;
    careerCategoriesId?: string;
    companyName?: string;
    taxCode?: string;
    logoUrl?: string;
    bannerUrl?: string;
    location?: string;
    description?: string;
    websiteUrl?: string;
  };
}

export interface IResponseListApiUserDto extends IApiResponse<IUserDto[]> {}
