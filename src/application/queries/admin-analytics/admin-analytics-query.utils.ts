import type {
  IRequestAdminGrowthDto,
  TAnalyticsGroupBy,
  TAnalyticsRange,
} from 'src/application/dtos/admin-analytics/req.admin-analytics.dto';
import {
  EAnalyticGroupBy,
  EAnalyticRange,
} from 'src/common/constants/enum/analytics.enum';

export interface IResolvedAnalyticsWindow {
  range: TAnalyticsRange;
  groupBy: TAnalyticsGroupBy;
  startDate: Date;
  endDate: Date;
}

export function resolveAnalyticsWindow(
  dto: IRequestAdminGrowthDto,
): IResolvedAnalyticsWindow {
  const range = dto.range ?? EAnalyticRange.SEVEN_DAYS;
  const defaultGroupBy: Record<TAnalyticsRange, TAnalyticsGroupBy> = {
    [EAnalyticRange.SEVEN_DAYS]: EAnalyticGroupBy.DAY,
    [EAnalyticRange.THIRTY_DAYS]: EAnalyticGroupBy.DAY,
    [EAnalyticRange.NINETY_DAYS]: EAnalyticGroupBy.DAY,
    [EAnalyticRange.ONE_YEAR]: EAnalyticGroupBy.MONTH,
  };
  const groupBy = dto.groupBy ?? defaultGroupBy[range];
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);

  switch (range) {
    case EAnalyticRange.SEVEN_DAYS:
      startDate.setDate(startDate.getDate() - 6);
      break;
    case EAnalyticRange.THIRTY_DAYS:
      startDate.setDate(startDate.getDate() - 29);
      break;
    case EAnalyticRange.NINETY_DAYS:
      startDate.setDate(startDate.getDate() - 89);
      break;
    case EAnalyticRange.ONE_YEAR:
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(1);
      break;
  }

  return { range, groupBy, startDate, endDate };
}

export function buildAnalyticsBuckets(
  startDate: Date,
  endDate: Date,
  groupBy: TAnalyticsGroupBy,
): string[] {
  const buckets: string[] = [];
  const current = new Date(startDate);

  if (groupBy === EAnalyticGroupBy.DAY) {
    current.setHours(0, 0, 0, 0);
    const last = new Date(endDate);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
      buckets.push(formatBucket(current, EAnalyticGroupBy.DAY));
      current.setDate(current.getDate() + 1);
    }
    return buckets;
  }

  if (groupBy === EAnalyticGroupBy.MONTH) {
    current.setDate(1);
    const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= last) {
      buckets.push(formatBucket(current, EAnalyticGroupBy.MONTH));
      current.setMonth(current.getMonth() + 1);
    }
    return buckets;
  }

  current.setMonth(Math.floor(current.getMonth() / 3) * 3, 1);
  const last = new Date(
    endDate.getFullYear(),
    Math.floor(endDate.getMonth() / 3) * 3,
    1,
  );

  while (current <= last) {
    buckets.push(formatBucket(current, EAnalyticGroupBy.QUARTER));
    current.setMonth(current.getMonth() + 3);
  }

  return buckets;
}

export function mergeAnalyticsSeries(
  buckets: string[],
  rows: Array<{ bucket: string; total: number }>,
): Array<{ bucket: string; total: number }> {
  const rowMap = new Map(rows.map((row) => [row.bucket, row.total]));
  return buckets.map((bucket) => ({
    bucket,
    total: rowMap.get(bucket) ?? 0,
  }));
}

function formatBucket(date: Date, groupBy: TAnalyticsGroupBy): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  if (groupBy === EAnalyticGroupBy.DAY) {
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (groupBy === EAnalyticGroupBy.MONTH) {
    return `${year}-${month}`;
  }

  return `${year}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}
