import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { ApiResponseDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseJobApplicationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cvId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  jobId: string;

  @ApiPropertyOptional()
  matchingScore?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({
    enum: Object.values(EJobApplicationStatus),
    example: Object.values(EJobApplicationStatus).join(' | '),
  })
  status: EJobApplicationStatus;

  @ApiPropertyOptional()
  scheduleTime?: Date;

  @ApiPropertyOptional()
  scheduleLocation?: string;

  @ApiPropertyOptional()
  scheduleLink?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ResponseApiJobApplicationDto extends ApiResponseDto<ResponseJobApplicationDto> {
  @ApiProperty({ type: ResponseJobApplicationDto })
  declare data: ResponseJobApplicationDto;
}

export class ResponseListApiJobApplicationDto extends ApiResponseDto<
  ResponseJobApplicationDto[]
> {
  @ApiProperty({ type: [ResponseJobApplicationDto] })
  declare data: ResponseJobApplicationDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}
