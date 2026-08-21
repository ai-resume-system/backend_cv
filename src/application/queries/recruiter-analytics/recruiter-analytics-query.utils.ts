import { ERecruiterAnalyticsGroupBy } from 'src/application/dtos/recruiter-analytics/req.recruiter-analytics.dto';

interface IRecruiterAnalyticsBucket {
  bucket: string;
  label: string;
}

interface IResolvedRecruiterTrendWindow {
  groupBy: ERecruiterAnalyticsGroupBy;
  startDate: Date;
  endDate: Date;
  buckets: IRecruiterAnalyticsBucket[];
}

export function resolveRecruiterTrendWindow(
  groupBy?: ERecruiterAnalyticsGroupBy,
): IResolvedRecruiterTrendWindow {
  const resolvedGroupBy = groupBy ?? ERecruiterAnalyticsGroupBy.WEEK;
  const now = new Date();
  const endDate = endOfDay(now);
  const buckets = buildRecruiterAnalyticsBuckets(now, resolvedGroupBy);
  const startDate = startOfDay(bucketStartDate(buckets[0].bucket, resolvedGroupBy));

  return {
    groupBy: resolvedGroupBy,
    startDate,
    endDate,
    buckets,
  };
}

export function mergeRecruiterTrendRows(
  buckets: IRecruiterAnalyticsBucket[],
  rows: Array<{ bucket: string; total: number }>,
): Array<{ bucket: string; label: string; value: number }> {
  const rowMap = new Map(rows.map((row) => [row.bucket, row.total]));
  return buckets.map((bucket) => ({
    bucket: bucket.bucket,
    label: bucket.label,
    value: rowMap.get(bucket.bucket) ?? 0,
  }));
}

function buildRecruiterAnalyticsBuckets(
  now: Date,
  groupBy: ERecruiterAnalyticsGroupBy,
): IRecruiterAnalyticsBucket[] {
  const count =
    groupBy === ERecruiterAnalyticsGroupBy.QUARTER
      ? 4
      : groupBy === ERecruiterAnalyticsGroupBy.YEAR
        ? 5
        : 6;

  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    const date = new Date(now);

    if (groupBy === ERecruiterAnalyticsGroupBy.WEEK) {
      date.setDate(date.getDate() - offset * 7);
      const start = startOfIsoWeek(date);
      return {
        bucket: formatBucket(start, groupBy),
        label: `${start.getDate()}/${start.getMonth() + 1}`,
      };
    }

    if (groupBy === ERecruiterAnalyticsGroupBy.MONTH) {
      date.setMonth(date.getMonth() - offset, 1);
      return {
        bucket: formatBucket(date, groupBy),
        label: `${date.getMonth() + 1}/${date.getFullYear()}`,
      };
    }

    if (groupBy === ERecruiterAnalyticsGroupBy.QUARTER) {
      date.setMonth(Math.floor(date.getMonth() / 3) * 3 - offset * 3, 1);
      return {
        bucket: formatBucket(date, groupBy),
        label: `Q${Math.floor(date.getMonth() / 3) + 1}/${date.getFullYear()}`,
      };
    }

    date.setFullYear(date.getFullYear() - offset, 0, 1);
    return {
      bucket: formatBucket(date, groupBy),
      label: `${date.getFullYear()}`,
    };
  });
}

function bucketStartDate(
  bucket: string,
  groupBy: ERecruiterAnalyticsGroupBy,
): Date {
  if (groupBy === ERecruiterAnalyticsGroupBy.WEEK) {
    return isoWeekStartDate(bucket);
  }

  if (groupBy === ERecruiterAnalyticsGroupBy.MONTH) {
    const [year, month] = bucket.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }

  if (groupBy === ERecruiterAnalyticsGroupBy.QUARTER) {
    const [year, quarter] = bucket.split('-Q').map(Number);
    return new Date(year, (quarter - 1) * 3, 1);
  }

  return new Date(Number(bucket), 0, 1);
}

function formatBucket(date: Date, groupBy: ERecruiterAnalyticsGroupBy): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  if (groupBy === ERecruiterAnalyticsGroupBy.WEEK) {
    const { isoYear, isoWeek } = getIsoWeek(date);
    return `${isoYear}-W${`${isoWeek}`.padStart(2, '0')}`;
  }

  if (groupBy === ERecruiterAnalyticsGroupBy.MONTH) {
    return `${year}-${month}`;
  }

  if (groupBy === ERecruiterAnalyticsGroupBy.QUARTER) {
    return `${year}-Q${Math.floor(date.getMonth() / 3) + 1}`;
  }

  return `${year}`;
}

function getIsoWeek(date: Date): { isoYear: number; isoWeek: number } {
  const current = startOfDay(date);
  current.setDate(current.getDate() + 3 - ((current.getDay() + 6) % 7));
  const weekOne = new Date(current.getFullYear(), 0, 4);
  const isoWeek =
    1 +
    Math.round(
      ((current.getTime() - weekOne.getTime()) / 86400000 -
        3 +
        ((weekOne.getDay() + 6) % 7)) /
        7,
    );

  return { isoYear: current.getFullYear(), isoWeek };
}

function isoWeekStartDate(bucket: string): Date {
  const [yearPart, weekPart] = bucket.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  const fourthOfJanuary = new Date(year, 0, 4);
  const firstWeekStart = startOfIsoWeek(fourthOfJanuary);
  firstWeekStart.setDate(firstWeekStart.getDate() + (week - 1) * 7);
  return firstWeekStart;
}

function startOfIsoWeek(date: Date): Date {
  const current = startOfDay(date);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() - day + 1);
  return current;
}

function startOfDay(date: Date): Date {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  return current;
}

function endOfDay(date: Date): Date {
  const current = new Date(date);
  current.setHours(23, 59, 59, 999);
  return current;
}
