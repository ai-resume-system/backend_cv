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

export interface IUpdateCompanyDto {
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  logoUrl?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
  companySizeMin?: number;
  companySizeMax?: number;
}
