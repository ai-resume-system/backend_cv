import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IRequestGetUsersDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  role?: EUserRole;
  status?: EUserStatus;
}

export interface IUpdateUserStatusDto {
  status: EUserStatus;
}

export interface IUpdateProfileDto {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IUpdateCompanyBaseDto {
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

export type IUpdateCompanyDto = Partial<Omit<IUpdateCompanyBaseDto, never>>;
