import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { ApiResponseDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseJobCompanyDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;

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

export class ResponseJobSkillDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  weight?: number;
}

export class ResponseJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  shortDescription?: string;

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

  @ApiPropertyOptional()
  expiredAt?: Date;

  @ApiProperty({
    enum: Object.values(EJobType),
    example: Object.values(EJobType).join(' | '),
  })
  jobType: EJobType;

  @ApiPropertyOptional()
  rejectReason?: string;

  @ApiProperty({
    enum: Object.values(EJobStatus),
    example: Object.values(EJobStatus).join(' | '),
  })
  status: EJobStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ResponseJobCompanyDto })
  company: ResponseJobCompanyDto;

  @ApiPropertyOptional({ type: ResponseJobCareerCategoryDto })
  careerCategory?: ResponseJobCareerCategoryDto;

  @ApiPropertyOptional({ type: [ResponseJobSkillDto] })
  skills?: ResponseJobSkillDto[];

  @ApiPropertyOptional()
  isFavourited?: boolean;
}

export class ResponseApiJobDto extends ApiResponseDto<ResponseJobDto> {
  @ApiProperty({ type: ResponseJobDto })
  declare data: ResponseJobDto;
}

export class ResponseListApiJobDto extends ApiResponseDto<ResponseJobDto[]> {
  @ApiProperty({ type: [ResponseJobDto] })
  declare data: ResponseJobDto[];
}
