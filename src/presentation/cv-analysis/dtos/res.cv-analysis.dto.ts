import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseCVAnalysisSkillDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  normalizedName: string;

  @ApiPropertyOptional()
  confidence?: number;

  @ApiPropertyOptional()
  skillId?: string;
}

export class ResponseCVAnalysisEducationDto {
  @ApiPropertyOptional()
  school?: string;

  @ApiPropertyOptional()
  degree?: string;

  @ApiPropertyOptional()
  fieldOfStudy?: string;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class ResponseCVAnalysisExperienceDto {
  @ApiPropertyOptional()
  company?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class ResponseCVAnalysisDto {
  @ApiProperty()
  cvId: string;

  @ApiProperty({ enum: EProcessingStatus })
  processingStatus: EProcessingStatus;

  @ApiPropertyOptional()
  summary?: string;

  @ApiPropertyOptional()
  score?: number;

  @ApiProperty({ type: [ResponseCVAnalysisSkillDto] })
  skills: ResponseCVAnalysisSkillDto[];

  @ApiProperty({ type: [ResponseCVAnalysisEducationDto] })
  education: ResponseCVAnalysisEducationDto[];

  @ApiProperty({ type: [ResponseCVAnalysisExperienceDto] })
  experience: ResponseCVAnalysisExperienceDto[];

  @ApiProperty({ type: [String] })
  suggestions: string[];

  @ApiPropertyOptional()
  rawText?: string;

  @ApiPropertyOptional()
  parsedDataId?: string;

  @ApiProperty()
  updatedAt: Date;
}

export class ResponseApiCVAnalysisDto extends ApiResponseDto<ResponseCVAnalysisDto> {
  @ApiProperty({ type: ResponseCVAnalysisDto })
  declare data: ResponseCVAnalysisDto;
}

export class ResponseCVAnalyzeActionDto {
  @ApiProperty()
  cvId: string;

  @ApiProperty({ enum: EProcessingStatus })
  processingStatus: EProcessingStatus;

  @ApiProperty()
  message: string;
}

export class ResponseApiCVAnalyzeActionDto extends ApiResponseDto<ResponseCVAnalyzeActionDto> {
  @ApiProperty({ type: ResponseCVAnalyzeActionDto })
  declare data: ResponseCVAnalyzeActionDto;
}
