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
import {
  EJobAction,
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';
import { parseJobExpiredAtInput } from 'src/common/utils/date-time.util';
import { transfomerPagination } from 'src/common/utils/request-pagination.utils';

export class RequestGetJobsDto extends RequestPaginationDto {
  @ApiPropertyOptional({
    description: 'Search by title, address and search company name',
  })
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

  @ApiPropertyOptional({ description: 'Minimum experience years (e.g. 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYearsMin?: number;

  @ApiPropertyOptional({ description: 'Maximum experience years (e.g. 5)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYearsMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs by company slug, e.g: cong-ty-abc',
  })
  @IsOptional()
  @IsString()
  companySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  careerCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter jobs by career category slug, e.g: y-te',
  })
  @IsOptional()
  @IsString()
  careerCategorySlug?: string;

  @ApiPropertyOptional({ enum: EJobStatus })
  @IsOptional()
  @IsEnum(EJobStatus)
  status?: EJobStatus;

  @ApiPropertyOptional({ enum: EJobType })
  @IsOptional()
  @IsEnum(EJobType)
  jobType?: EJobType;

  @ApiPropertyOptional({ enum: EJobEducationLevel })
  @IsOptional()
  @IsEnum(EJobEducationLevel)
  educationLevel?: EJobEducationLevel;

  @ApiPropertyOptional({ enum: EJobWorkArrangement })
  @IsOptional()
  @IsEnum(EJobWorkArrangement)
  workArrangement?: EJobWorkArrangement;

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

export class RequestGetRelatedJobsDto {
  @ApiPropertyOptional({
    description: 'Maximum related jobs returned',
    default: 6,
  })
  @Transform(({ value }) => transfomerPagination(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 6;
}

export class RequestGetJobMatchDto {
  @ApiProperty()
  @IsUUID()
  cvId: string;
}

export class RequestCalculateJobMatchDto {
  @ApiProperty()
  @IsUUID()
  cvId: string;
}

export class RequestJobSkillDto {
  @ApiProperty()
  @IsUUID()
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
  title: string;

  @ApiPropertyOptional({ enum: EJobAction, default: EJobAction.SUBMIT })
  @IsOptional()
  @IsEnum(EJobAction)
  action?: EJobAction;

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
  @Transform(({ value }) => Number(value))
  @IsInt()
  vacancyCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
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
  @IsEnum(EJobType)
  jobType?: EJobType;

  @ApiPropertyOptional({
    enum: EJobEducationLevel,
    default: EJobEducationLevel.NONE,
  })
  @IsOptional()
  @IsEnum(EJobEducationLevel)
  educationLevel?: EJobEducationLevel;

  @ApiPropertyOptional({ enum: EJobWorkArrangement })
  @IsOptional()
  @IsEnum(EJobWorkArrangement)
  workArrangement?: EJobWorkArrangement;

  @ApiPropertyOptional({ type: [RequestJobSkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestJobSkillDto)
  skills?: RequestJobSkillDto[];
}

export class RequestUpdateJobDto {
  @ApiPropertyOptional({ enum: EJobAction })
  @IsOptional()
  @IsEnum(EJobAction)
  action?: EJobAction;

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
  @Transform(({ value }) => Number(value))
  @IsInt()
  vacancyCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
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
  @IsEnum(EJobType)
  jobType?: EJobType;

  @ApiPropertyOptional({ enum: EJobEducationLevel })
  @IsOptional()
  @IsEnum(EJobEducationLevel)
  educationLevel?: EJobEducationLevel;

  @ApiPropertyOptional({ enum: EJobWorkArrangement })
  @IsOptional()
  @IsEnum(EJobWorkArrangement)
  workArrangement?: EJobWorkArrangement;

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

export class RequestCloseJobDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  closeReason: string;
}
