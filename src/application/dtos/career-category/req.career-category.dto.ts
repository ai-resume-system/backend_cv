import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IRequestGetCareerCategoriesDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IRequestGetTopCareerCategoriesDto {
  limit?: number;
}

export interface IRequestCreateCareerCategoryDto {
  name: string;
  description?: string;
}

export interface IRequestUpdateCareerCategoryDto {
  name?: string;
  description?: string;
  status?: ECareerCategoriesStatus;
}
