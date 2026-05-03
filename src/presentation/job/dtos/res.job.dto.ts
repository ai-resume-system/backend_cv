import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { MetaDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiPropertyOptional()
  careerCategoryId?: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  salaryMax?: number;

  @ApiPropertyOptional()
  experienceYears?: number;

  @ApiProperty({ enum: EJobType })
  jobType: EJobType;

  @ApiPropertyOptional()
  expiredAt?: Date;

  @ApiPropertyOptional()
  rejectReason?: string;

  @ApiProperty({ enum: EJobStatus })
  status: EJobStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ResponseApiJobDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseJobDto })
  data: ResponseJobDto;
}

export class ResponseListApiJobDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: [ResponseJobDto] })
  data: ResponseJobDto[];

  @ApiProperty({ type: PaginationDto })
  pagination?: PaginationDto;

  @ApiPropertyOptional()
  nextCursor?: string;
}
