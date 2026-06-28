import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';
import { ApiResponseDto, PaginationDto } from 'src/common/dto/response.dto';
import { ResponseCompanyDto } from 'src/presentation/account/dtos/res.account.dto';

export class ResponseJobCompanyDto extends PartialType(ResponseCompanyDto) {
  @ApiProperty()
  id: string;
}

export class ResponseJobCareerCategoryDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  slug?: string;
}

export class ResponseJobSkillDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  weight?: number;
}

export class ResponsePublicJobDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  salaryMax?: number;

  @ApiPropertyOptional()
  vacancyCount?: number;

  @ApiPropertyOptional()
  experienceYears?: number;

  @ApiPropertyOptional()
  expiredAt?: Date;

  @ApiProperty({
    enum: Object.values(EJobType),
    example: Object.values(EJobType).join(' | '),
  })
  jobType: EJobType;

  @ApiProperty({
    enum: Object.values(EJobEducationLevel),
    example: Object.values(EJobEducationLevel).join(' | '),
  })
  educationLevel: EJobEducationLevel;

  @ApiPropertyOptional({
    enum: Object.values(EJobWorkArrangement),
    example: Object.values(EJobWorkArrangement).join(' | '),
  })
  workArrangement?: EJobWorkArrangement;

  @ApiProperty({
    enum: Object.values(EJobStatus),
    example: Object.values(EJobStatus).join(' | '),
  })
  status: EJobStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  isFavourited?: boolean;

  @ApiProperty({ type: ResponseJobCompanyDto })
  company: ResponseJobCompanyDto;

  @ApiPropertyOptional({ type: ResponseJobCareerCategoryDto })
  careerCategory?: ResponseJobCareerCategoryDto;

  @ApiPropertyOptional({ type: [ResponseJobSkillDto] })
  skills?: ResponseJobSkillDto[];
}

export class ResponseManagedJobDto extends ResponsePublicJobDto {
  @ApiPropertyOptional()
  rejectReason?: string;

  @ApiPropertyOptional()
  closeReason?: string;
}

export class ResponseApiPublicJobDto extends ApiResponseDto<ResponsePublicJobDto> {
  @ApiProperty({ type: ResponsePublicJobDto })
  declare data: ResponsePublicJobDto;
}

export class ResponseListApiPublicJobDto extends ApiResponseDto<ResponsePublicJobDto[]> {
  @ApiProperty({ type: [ResponsePublicJobDto] })
  declare data: ResponsePublicJobDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}

export class ResponseApiRecruiterJobDto extends ApiResponseDto<ResponseManagedJobDto> {
  @ApiProperty({ type: ResponseManagedJobDto })
  declare data: ResponseManagedJobDto;
}

export class ResponseListApiRecruiterJobDto extends ApiResponseDto<ResponseManagedJobDto[]> {
  @ApiProperty({ type: [ResponseManagedJobDto] })
  declare data: ResponseManagedJobDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}

export class ResponseApiAdminJobDto extends ApiResponseDto<ResponseManagedJobDto> {
  @ApiProperty({ type: ResponseManagedJobDto })
  declare data: ResponseManagedJobDto;
}

export class ResponseListApiAdminJobDto extends ApiResponseDto<ResponseManagedJobDto[]> {
  @ApiProperty({ type: [ResponseManagedJobDto] })
  declare data: ResponseManagedJobDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}

export class ResponseJobMatchBreakdownDto {
  @ApiProperty()
  skillMatch: number;

  @ApiProperty()
  careerCategoryMatch: number;

  @ApiProperty()
  experienceMatch: number;

  @ApiProperty()
  titleKeywordSimilarity: number;
}

export class ResponseJobMatchSkillEvidenceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  normalizedName: string;

  @ApiPropertyOptional()
  systemSkillSlug?: string;

  @ApiPropertyOptional()
  confidence?: number;
}

export class ResponseJobMatchDto {
  @ApiProperty()
  cvId: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  jobSlug: string;

  @ApiProperty()
  matchScore: number;

  @ApiProperty({ type: ResponseJobMatchBreakdownDto })
  breakdown: ResponseJobMatchBreakdownDto;

  @ApiProperty({ type: [ResponseJobMatchSkillEvidenceDto] })
  matchedSkills: ResponseJobMatchSkillEvidenceDto[];

  @ApiProperty({ type: [ResponseJobSkillDto] })
  missingSkills: ResponseJobSkillDto[];

  @ApiProperty({ type: [String] })
  strengths: string[];

  @ApiProperty({ type: [String] })
  risks: string[];

  @ApiProperty({ type: [String] })
  improvementSuggestions: string[];

  @ApiProperty()
  computedAt: Date;
}

export class ResponseApiJobMatchDto extends ApiResponseDto<ResponseJobMatchDto> {
  @ApiProperty({ type: ResponseJobMatchDto })
  declare data: ResponseJobMatchDto;
}
