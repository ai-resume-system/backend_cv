import { IApiResponse } from 'src/common/interface/api-response.interface';
import {
  IJobCareerCategoryDto,
  IPublicJobCompanyDto,
} from '../job/res.job.dto';

export interface IFavouriteJobItemDto {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  vacancyCount?: number;
  experienceYears?: number;
  expiredAt?: Date;
  company: IPublicJobCompanyDto;
  careerCategory?: IJobCareerCategoryDto;
  isFavourited: boolean;
  createdAt: Date;
}

export interface IResponseFavouriteJobDto {
  message: string;
}

export interface IResponseApiFavouriteJobDto extends IApiResponse<IResponseFavouriteJobDto> {}

export interface IResponseListApiFavouriteJobDto extends IApiResponse<
  IFavouriteJobItemDto[]
> {}
