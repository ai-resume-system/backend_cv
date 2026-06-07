import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IRequestGetUsersDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  role?: EUserRole[];
  status?: EUserStatus;
}

export interface IRequestUpdateUserStatusDto {
  status: EUserStatus;
}
