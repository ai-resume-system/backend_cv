import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

export class RequestCreateJobApplicationDto {
  @ApiProperty({ description: 'CV ID' })
  @IsUUID()
  cvId: string;

  @ApiProperty({ description: 'Job ID' })
  @IsUUID()
  jobId: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RequestUpdateJobApplicationStatusDto {
  @ApiProperty({ enum: EJobApplicationStatus, description: 'New status' })
  @IsEnum(EJobApplicationStatus)
  status: EJobApplicationStatus;
}

export class RequestGetJobApplicationsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(EJobApplicationStatus)
  status?: EJobApplicationStatus;
}
