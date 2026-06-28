import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EInterviewStatus,
  EInterviewType,
  EJobApplicationStatus,
} from 'src/common/constants/enum/job-application.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { RequestPaginationDto } from 'src/common/dto/request.dto';
import { transfomerPagination } from 'src/common/utils/request-pagination.utils';
import { parseVietnamDateTimeInput } from 'src/common/utils/date-time.util';

export class RequestCreateJobApplicationDto {
  @ApiProperty({ description: 'CV ID' })
  @IsUUID()
  cvId: string;

  @ApiProperty({ description: 'Job ID' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ description: 'Applicant full name' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: 'Applicant contact email' })
  @IsEmail()
  @MaxLength(255)
  contactEmail: string;

  @ApiProperty({ description: 'Applicant contact phone number' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const phone = value.replace(/\s+/g, '');
    if (phone.startsWith('0')) {
      return `+84${phone.slice(1)}`;
    }
    return phone;
  })
  @Matches(/^(\+84)(3|5|7|8|9)[0-9]{8}$/, ERROR_CODES.AUTH_PHONE_INVALID)
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Applicant cover letter' })
  @IsOptional()
  @IsString()
  coverLetter?: string;
}

export class RequestUpdateJobApplicationStatusDto {
  @ApiProperty({ enum: EJobApplicationStatus, description: 'New status' })
  @IsEnum(EJobApplicationStatus)
  status: EJobApplicationStatus;

  @ApiPropertyOptional({
    description: 'Rejection reason in HTML format',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({ enum: EInterviewType, description: 'Interview type' })
  @IsOptional()
  @IsEnum(EInterviewType)
  interviewType?: EInterviewType;

  @ApiPropertyOptional({ description: 'Interview preparation notes in HTML format' })
  @IsOptional()
  @IsString()
  interviewNotes?: string;

  @ApiPropertyOptional({ description: 'Onboarding notes in HTML format' })
  @IsOptional()
  @IsString()
  onboardingNotes?: string;

  @ApiPropertyOptional({
    description:
      'Interview schedule time. Neu khong kem timezone, backend hieu theo gio Viet Nam.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return parseVietnamDateTimeInput(value);
    } catch {
      return value;
    }
  })
  @IsDate()
  scheduleTime?: Date;

  @ApiPropertyOptional({ description: 'Interview location' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  scheduleLocation?: string;

  @ApiPropertyOptional({ description: 'Interview meeting link' })
  @IsOptional()
  @IsString()
  scheduleLink?: string;
}

export class RequestUpdateJobApplicationInterviewStatusDto {
  @ApiProperty({
    enum: EInterviewStatus,
    description: 'Interview progress status',
  })
  @IsEnum(EInterviewStatus)
  interviewStatus: EInterviewStatus;
}

export class RequestGetJobApplicationsDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(EJobApplicationStatus)
  status?: EJobApplicationStatus;

  @ApiPropertyOptional({
    enum: ['createdAt', 'matchingScore'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'matchingScore'])
  sortBy?: 'createdAt' | 'matchingScore';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class RequestGetRecruiterJobApplicationsDto extends RequestPaginationDto {
  @ApiPropertyOptional({
    description: 'Search by applicant name, email, phone',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by job id' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({
    enum: EJobApplicationStatus,
  })
  @IsOptional()
  @IsEnum(EJobApplicationStatus)
  status?: EJobApplicationStatus;

  @ApiPropertyOptional({
    enum: ['createdAt', 'matchingScore'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'matchingScore'])
  sortBy?: 'createdAt' | 'matchingScore';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class RequestGetRecruiterNewApplicantsDto {
  @ApiPropertyOptional({
    default: 10,
    description: 'Maximum applicants returned',
  })
  @Transform(({ value }) => transfomerPagination(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filter by job id' })
  @IsOptional()
  @IsUUID()
  jobId?: string;
}

export class RequestGetRecruiterInterviewsDto extends RequestPaginationDto {
  @ApiPropertyOptional({
    description:
      'Schedule lower bound. Neu khong kem timezone, backend hieu theo gio Viet Nam.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return parseVietnamDateTimeInput(value);
    } catch {
      return value;
    }
  })
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    description:
      'Schedule upper bound. Neu khong kem timezone, backend hieu theo gio Viet Nam.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return parseVietnamDateTimeInput(value);
    } catch {
      return value;
    }
  })
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({ description: 'Filter by job id' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({
    description: 'Search by applicant name, email, phone',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'matchingScore', 'scheduleTime'],
    default: 'scheduleTime',
  })
  @IsOptional()
  @IsIn(['createdAt', 'matchingScore', 'scheduleTime'])
  sortBy?: 'createdAt' | 'matchingScore' | 'scheduleTime';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
