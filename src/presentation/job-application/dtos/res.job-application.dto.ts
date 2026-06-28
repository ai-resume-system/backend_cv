import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import {
  EInterviewStatus,
  EInterviewType,
  EJobApplicationStatus,
} from 'src/common/constants/enum/job-application.enum';
import { ApiResponseDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseJobApplicationCVDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  summary?: string;

  @ApiPropertyOptional({
    enum: Object.values(EProcessingStatus),
    example: Object.values(EProcessingStatus).join(' | '),
  })
  processingStatus?: string;
}

export class ResponseJobApplicationJobCompanyDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;
}

export class ResponseJobApplicationJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional({ type: ResponseJobApplicationJobCompanyDto })
  company?: ResponseJobApplicationJobCompanyDto;
}

export class ResponseJobApplicationUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class ResponseJobSeekerJobApplicationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cvId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  jobId: string;

  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  coverLetter?: string;

  @ApiProperty({ default: 0 })
  matchingScore: number;

  @ApiProperty({
    enum: Object.values(EJobApplicationStatus),
    example: Object.values(EJobApplicationStatus).join(' | '),
  })
  status: EJobApplicationStatus;

  @ApiPropertyOptional({
    enum: Object.values(EInterviewType),
    example: Object.values(EInterviewType).join(' | '),
  })
  interviewType?: EInterviewType;

  @ApiProperty({
    enum: Object.values(EInterviewStatus),
    example: Object.values(EInterviewStatus).join(' | '),
  })
  interviewStatus: EInterviewStatus;

  @ApiPropertyOptional()
  interviewNotes?: string;

  @ApiPropertyOptional()
  onboardingNotes?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

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

  @ApiPropertyOptional({
    type: ResponseJobApplicationCVDto,
  })
  cv?: ResponseJobApplicationCVDto;

  @ApiPropertyOptional({
    type: ResponseJobApplicationJobDto,
  })
  job?: ResponseJobApplicationJobDto;
}

export class ResponseRecruiterJobApplicationDto extends ResponseJobSeekerJobApplicationDto {
  @ApiPropertyOptional({ type: ResponseJobApplicationUserDto })
  user?: ResponseJobApplicationUserDto;
}

export class ResponseApiJobSeekerJobApplicationDto extends ApiResponseDto<ResponseJobSeekerJobApplicationDto> {
  @ApiProperty({ type: ResponseJobSeekerJobApplicationDto })
  declare data: ResponseJobSeekerJobApplicationDto;
}

export class ResponseListApiJobSeekerJobApplicationDto extends ApiResponseDto<
  ResponseJobSeekerJobApplicationDto[]
> {
  @ApiProperty({ type: [ResponseJobSeekerJobApplicationDto] })
  declare data: ResponseJobSeekerJobApplicationDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}

export class ResponseApiRecruiterJobApplicationDto extends ApiResponseDto<ResponseRecruiterJobApplicationDto> {
  @ApiProperty({ type: ResponseRecruiterJobApplicationDto })
  declare data: ResponseRecruiterJobApplicationDto;
}

export class ResponseListApiRecruiterJobApplicationDto extends ApiResponseDto<
  ResponseRecruiterJobApplicationDto[]
> {
  @ApiProperty({ type: [ResponseRecruiterJobApplicationDto] })
  declare data: ResponseRecruiterJobApplicationDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}
