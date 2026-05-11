import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

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
  matchingScore?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ enum: EJobApplicationStatus })
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
}
