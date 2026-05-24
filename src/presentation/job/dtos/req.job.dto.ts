import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetJobsDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Search by title, location' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Column to sort' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  careerCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs by career category slug, e.g: y-te',
  })
  @IsOptional()
  @IsString()
  careerCategorySlug?: string;

  @ApiPropertyOptional({ enum: EJobStatus })
  @IsOptional()
  @IsString()
  status?: EJobStatus;
}

export class RequestCreateJobDto {
  @ApiProperty({ example: 'Backend Developer' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  salaryMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  careerCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiredAt?: string;
}

export class RequestUpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  salaryMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  careerCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiredAt?: string;
}

export class RequestRejectJobDto {
  @ApiProperty()
  @IsString()
  rejectReason: string;
}
