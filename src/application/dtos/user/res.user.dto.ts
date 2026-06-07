import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IUserListProfileResponseDto {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface IUserListCompanyResponseDto {
  name?: string;
  logoUrl?: string | null;
}

export interface IUserListResponseDto {
  id: string;
  email: string;
  phone?: string;
  role: EUserRole;
  status: EUserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile?: IUserListProfileResponseDto;
  company?: IUserListCompanyResponseDto;
}

export interface IUserDetailProfileResponseDto {
  fullName?: string;
  avatarUrl?: string | null;
  bio?: string;
}

export interface IUserDetailCompanyResponseDto {
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
}

export interface IUserDetailResponseDto {
  id: string;
  email: string;
  phone?: string;
  role: EUserRole;
  status: EUserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile?: IUserDetailProfileResponseDto;
  company?: IUserDetailCompanyResponseDto;
}

export interface IResponseApiUserDetailDto
  extends IApiResponse<IUserDetailResponseDto> {}

export interface IResponseListApiUserDto
  extends IApiResponse<IUserListResponseDto[]> {}
