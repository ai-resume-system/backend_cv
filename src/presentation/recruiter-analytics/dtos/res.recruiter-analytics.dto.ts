import { ApiProperty } from '@nestjs/swagger';
import { ERecruiterAnalyticsGroupBy } from 'src/application/dtos/recruiter-analytics/req.recruiter-analytics.dto';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseRecruiterOverviewDto {
  @ApiProperty()
  totalJobs: number;

  @ApiProperty()
  openJobs: number;

  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  upcomingInterviews: number;
}

export class ResponseRecruiterApplicationTrendItemDto {
  @ApiProperty()
  bucket: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  value: number;
}

export class ResponseRecruiterApplicationTrendDto {
  @ApiProperty({ enum: ERecruiterAnalyticsGroupBy })
  groupBy: ERecruiterAnalyticsGroupBy;

  @ApiProperty({ type: [ResponseRecruiterApplicationTrendItemDto] })
  items: ResponseRecruiterApplicationTrendItemDto[];
}

export class ResponseApiRecruiterOverviewDto extends ApiResponseDto<ResponseRecruiterOverviewDto> {
  @ApiProperty({ type: ResponseRecruiterOverviewDto })
  declare data: ResponseRecruiterOverviewDto;
}

export class ResponseApiRecruiterApplicationTrendDto extends ApiResponseDto<ResponseRecruiterApplicationTrendDto> {
  @ApiProperty({ type: ResponseRecruiterApplicationTrendDto })
  declare data: ResponseRecruiterApplicationTrendDto;
}
