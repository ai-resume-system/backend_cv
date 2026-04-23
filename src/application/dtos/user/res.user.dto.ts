import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';

export interface IUserDto {
  id: string;
  email: string;
  phone?: string;
  role: EUserRole;
  status: EUserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetAllUsersResponseDto {
  data: IUserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
    location?: string;
    description?: string;
    websiteUrl?: string;
  };
}
