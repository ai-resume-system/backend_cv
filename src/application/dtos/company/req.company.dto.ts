import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IGetCompaniesDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  address?: string;
  careerCategoryId?: string;
  careerCategorySlug?: string;
}
