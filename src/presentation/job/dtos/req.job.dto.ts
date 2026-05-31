import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';
import { parseJobExpiredAtInput } from 'src/common/utils/date-time.util';

export class RequestGetJobsDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Search by title, address' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Column to sort' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Filter jobs by address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Filter jobs by experience years' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs by company slug, e.g: cong-ty-abc',
  })
  @IsOptional()
  @IsString()
  companySlug?: string;

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

  @ApiPropertyOptional({ enum: EJobType })
  @IsOptional()
  @IsString()
  jobType?: EJobType;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter jobs by skill ids',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter jobs by skill slugs',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  skillSlugs?: string[];
}

export class RequestJobSkillDto {
  @ApiProperty()
  @IsUUID('4')
  skillId: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  weight?: number;
}

export class RequestCreateJobDto {
  @ApiProperty({ example: 'Backend Developer' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

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
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return parseJobExpiredAtInput(value);
    } catch {
      return value;
    }
  })
  @IsDate()
  expiredAt?: Date;

  @ApiPropertyOptional({ enum: EJobType, default: EJobType.FULL_TIME })
  @IsOptional()
  @IsString()
  jobType?: EJobType;

  @ApiPropertyOptional({ type: [RequestJobSkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestJobSkillDto)
  skills?: RequestJobSkillDto[];
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
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

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
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return parseJobExpiredAtInput(value);
    } catch {
      return value;
    }
  })
  @IsDate()
  expiredAt?: Date;

  @ApiPropertyOptional({ enum: EJobType })
  @IsOptional()
  @IsString()
  jobType?: EJobType;

  @ApiPropertyOptional({ type: [RequestJobSkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestJobSkillDto)
  skills?: RequestJobSkillDto[];
}

export class RequestRejectJobDto {
  @ApiProperty()
  @IsString()
  rejectReason: string;
}
