import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import type {
  TAnalyticsGroupBy,
  TAnalyticsRange,
} from 'src/application/dtos/admin-analytics/req.admin-analytics.dto';
import {
  EAnalyticGroupBy,
  EAnalyticRange,
} from 'src/common/constants/enum/analytics.enum';

export class RequestAdminGrowthDto {
  @ApiPropertyOptional({
    enum: EAnalyticRange,
    default: EAnalyticRange.SEVEN_DAYS,
  })
  @IsOptional()
  @IsEnum(EAnalyticRange)
  range?: TAnalyticsRange;

  @ApiPropertyOptional({ enum: EAnalyticGroupBy })
  @IsOptional()
  @IsEnum(EAnalyticGroupBy)
  groupBy?: TAnalyticsGroupBy;
}
