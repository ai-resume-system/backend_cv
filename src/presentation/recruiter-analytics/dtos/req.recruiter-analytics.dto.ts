import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ERecruiterAnalyticsGroupBy } from 'src/application/dtos/recruiter-analytics/req.recruiter-analytics.dto';

export class RequestRecruiterApplicationTrendDto {
  @ApiPropertyOptional({
    enum: ERecruiterAnalyticsGroupBy,
    default: ERecruiterAnalyticsGroupBy.WEEK,
  })
  @IsOptional()
  @IsEnum(ERecruiterAnalyticsGroupBy)
  groupBy?: ERecruiterAnalyticsGroupBy;
}
