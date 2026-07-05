export enum ERecruiterAnalyticsGroupBy {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export interface IRequestRecruiterApplicationTrendDto {
  groupBy?: ERecruiterAnalyticsGroupBy;
}
