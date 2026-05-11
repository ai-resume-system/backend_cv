import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { MetaDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseJobCompanyDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  websiteUrl?: string;
}

export class ResponseJobCareerCategoryDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  slug?: string;
}

export class ResponseJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  shortDescription?: string;

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

  @ApiProperty({ enum: EJobStatus })
  status: EJobStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ResponseJobCompanyDto })
  company: ResponseJobCompanyDto;

  @ApiPropertyOptional({ type: ResponseJobCareerCategoryDto })
  careerCategory?: ResponseJobCareerCategoryDto;
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
}
