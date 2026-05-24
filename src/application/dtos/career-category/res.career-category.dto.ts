import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface IResponseCareerCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ECareerCategoriesStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Cho 1 bản ghi duy nhất
export interface IResponseApiCareerCategoryDto extends IApiResponse<IResponseCareerCategoryDto> {}

// Cho danh sách (có pagination)
export interface IResponseListApiCareerCategoryDto extends IApiResponse<
  IResponseCareerCategoryDto[]
> {}
