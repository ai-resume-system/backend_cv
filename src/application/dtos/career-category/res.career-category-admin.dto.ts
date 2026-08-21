import { IApiResponse } from 'src/common/interface/api-response.interface';
import { IResponsePublicCareerCategoryDto } from './res.career-category-public.dto';

export interface IResponseAdminCareerCategoryDto extends Partial<IResponsePublicCareerCategoryDto> {
  deletedAt?: Date;
}

export interface IResponseApiAdminCareerCategoryDto extends IApiResponse<IResponseAdminCareerCategoryDto> {}

export interface IResponseListApiAdminCareerCategoryDto extends IApiResponse<
  IResponseAdminCareerCategoryDto[]
> {}
