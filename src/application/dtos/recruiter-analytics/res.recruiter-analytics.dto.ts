import { IApiResponse } from 'src/common/interface/api-response.interface';
import { ERecruiterAnalyticsGroupBy } from './req.recruiter-analytics.dto';

export interface IRecruiterOverviewDto {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  upcomingInterviews: number;
}

export interface IRecruiterApplicationTrendItemDto {
  bucket: string;
  label: string;
  value: number;
}

export interface IRecruiterApplicationTrendDto {
  groupBy: ERecruiterAnalyticsGroupBy;
  items: IRecruiterApplicationTrendItemDto[];
}

export interface IResponseApiRecruiterOverviewDto
  extends IApiResponse<IRecruiterOverviewDto> {}

export interface IResponseApiRecruiterApplicationTrendDto
  extends IApiResponse<IRecruiterApplicationTrendDto> {}
