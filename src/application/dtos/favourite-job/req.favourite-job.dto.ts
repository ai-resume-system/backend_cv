import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IRequestGetFavouriteJobsDto extends IApiRequestPagination {}

export interface IRequestCreateFavouriteJobDto {
  jobId: string;
}
