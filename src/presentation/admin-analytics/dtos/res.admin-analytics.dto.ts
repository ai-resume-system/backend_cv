import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseAdminOverviewDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalRecruiters: number;

  @ApiProperty()
  totalJobSeekers: number;

  @ApiProperty()
  totalJobs: number;

  @ApiProperty()
  totalOpenJobs: number;

  @ApiProperty()
  totalPendingJobs: number;

  @ApiProperty()
  totalApplications: number;
}

export class ResponseAdminGrowthItemDto {
  @ApiProperty()
  bucket: string;

  @ApiProperty()
  total: number;
}

export class ResponseAdminRecentActivityMetadataDto {
  @ApiPropertyOptional()
  role?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiPropertyOptional()
  jobId?: string;
}

export class ResponseAdminRecentActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: [
      'user_registered',
      'job_created',
      'job_reviewed',
      'application_created',
    ],
  })
  type: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  occurredAt: Date;

  @ApiPropertyOptional({ type: ResponseAdminRecentActivityMetadataDto })
  metadata?: ResponseAdminRecentActivityMetadataDto;
}

export class ResponseApiAdminOverviewDto extends ApiResponseDto<ResponseAdminOverviewDto> {
  @ApiProperty({ type: ResponseAdminOverviewDto })
  declare data: ResponseAdminOverviewDto;
}

export class ResponseApiAdminGrowthDto extends ApiResponseDto<
  ResponseAdminGrowthItemDto[]
> {
  @ApiProperty({ type: [ResponseAdminGrowthItemDto] })
  declare data: ResponseAdminGrowthItemDto[];
}

export class ResponseApiAdminRecentActivityListDto extends ApiResponseDto<
  ResponseAdminRecentActivityDto[]
> {
  @ApiProperty({ type: [ResponseAdminRecentActivityDto] })
  declare data: ResponseAdminRecentActivityDto[];
}
