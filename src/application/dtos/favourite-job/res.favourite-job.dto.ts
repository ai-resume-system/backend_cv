import { IApiResponse } from 'src/common/interface/api-response.interface';
import { IJobCareerCategoryDto, IJobCompanyDto } from '../job/res.job.dto';

export interface IFavouriteJobItemDto {
  id: string;
  title: string;
  shortDescription?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: Date;
  company: IJobCompanyDto;
  careerCategory?: IJobCareerCategoryDto;
  isFavourited: boolean;
}

export interface IResponseFavouriteJobDto {
  message: string;
}

export interface IResponseApiFavouriteJobDto
  extends IApiResponse<IResponseFavouriteJobDto> {}

export interface IResponseListApiFavouriteJobDto
  extends IApiResponse<IFavouriteJobItemDto[]> {}
