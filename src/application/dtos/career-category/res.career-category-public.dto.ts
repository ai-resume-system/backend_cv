import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IResponsePublicCareerCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ECareerCategoriesStatus;
  createdAt: Date;
  updatedAt: Date;
  jobCount?: number;
}

export interface IResponseApiPublicCareerCategoryDto extends IApiResponse<IResponsePublicCareerCategoryDto> {}

export interface IResponseListApiPublicCareerCategoryDto extends IApiResponse<
  IResponsePublicCareerCategoryDto[]
> {}
