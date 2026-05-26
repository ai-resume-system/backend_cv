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
  fullName?: string;

  @ApiPropertyOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  coverLetter?: string;

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

  @ApiPropertyOptional({
    type: Object,
    example: {
      id: 'uuid',
      title: 'CV React Developer',
      fileUrl: 'https://example.com/cv.pdf',
      summary: 'Senior frontend developer',
    },
  })
  cv?: {
    id: string;
    title?: string;
    fileUrl?: string;
    summary?: string;
  };

  @ApiPropertyOptional({
    type: Object,
    example: {
      id: 'uuid',
      title: 'Frontend Developer',
      location: 'Ho Chi Minh City',
      company: {
        id: 'uuid',
        companyName: 'OpenAI VN',
        logoUrl: 'https://example.com/logo.png',
      },
    },
  })
  job?: {
    id: string;
    title: string;
    location?: string;
    company?: {
      id: string;
      companyName?: string;
      logoUrl?: string | null;
    };
  };

  @ApiPropertyOptional({
    type: Object,
    example: {
      id: 'uuid',
      email: 'candidate@example.com',
      phone: '+84901234567',
    },
  })
  user?: {
    id: string;
    email: string;
    phone?: string;
  };
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
