import {
  EAnalyticGroupBy,
  EAnalyticRange,
} from 'src/common/constants/enum/analytics.enum';

export type TAnalyticsRange = EAnalyticRange;
export type TAnalyticsGroupBy = EAnalyticGroupBy;

export interface IRequestAdminGrowthDto {
  range?: TAnalyticsRange;
  groupBy?: TAnalyticsGroupBy;
}
