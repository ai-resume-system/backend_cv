import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseCVAnalysisScoreBreakdownDto {
  @ApiProperty()
  roleClarity: number;

  @ApiProperty()
  skillCoverage: number;

  @ApiProperty()
  experienceQuality: number;

  @ApiProperty()
  impactEvidence: number;

  @ApiProperty()
  educationRelevance: number;

  @ApiProperty()
  atsReadiness: number;

  @ApiProperty()
  presentationClarity: number;
}

export class ResponseCVAnalysisMatchedSkillDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  normalizedName: string;

  @ApiPropertyOptional()
  systemSkillSlug?: string;

  @ApiPropertyOptional()
  confidence?: number;

  @ApiPropertyOptional({
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'unknown'],
  })
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';

  @ApiPropertyOptional()
  evidence?: string;

  @ApiPropertyOptional()
  skillId?: string;
}

export class ResponseCVAnalysisOtherSkillDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  normalizedName: string;

  @ApiPropertyOptional()
  confidence?: number;

  @ApiPropertyOptional()
  evidence?: string;
}

export class ResponseCVAnalysisCareerCategorySuggestionDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  confidence: number;
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
  durationMonths?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [String] })
  achievements: string[];
}

export class ResponseCVAnalysisProjectDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  role?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [String] })
  technologies: string[];

  @ApiProperty({ type: [String] })
  outcomes: string[];
}

export class ResponseCVAnalysisDto {
  @ApiProperty()
  cvId: string;

  @ApiProperty({ enum: EProcessingStatus })
  processingStatus: EProcessingStatus;

  @ApiPropertyOptional()
  summary?: string;

  @ApiPropertyOptional()
  resumeQualityScore?: number;

  @ApiProperty({ type: ResponseCVAnalysisScoreBreakdownDto })
  scoreBreakdown: ResponseCVAnalysisScoreBreakdownDto;

  @ApiProperty({ type: [ResponseCVAnalysisMatchedSkillDto] })
  matchedSkills: ResponseCVAnalysisMatchedSkillDto[];

  @ApiProperty({ type: [String] })
  improvementSuggestions: string[];

  @ApiProperty({ type: [ResponseCVAnalysisEducationDto] })
  education: ResponseCVAnalysisEducationDto[];

  @ApiProperty({ type: [ResponseCVAnalysisExperienceDto] })
  experience: ResponseCVAnalysisExperienceDto[];

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

  @ApiPropertyOptional()
  reusedExistingResult?: boolean;
}

export class ResponseApiCVAnalyzeActionDto extends ApiResponseDto<ResponseCVAnalyzeActionDto> {
  @ApiProperty({ type: ResponseCVAnalyzeActionDto })
  declare data: ResponseCVAnalyzeActionDto;
}

export class ResponseTempCVUploadDto {
  @ApiProperty()
  tempFileKey: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty({ enum: ['pdf', 'docx', 'doc'] })
  fileExtension: 'pdf' | 'docx' | 'doc';

  @ApiProperty()
  expiresInSeconds: number;
}

export class ResponseApiTempCVUploadDto extends ApiResponseDto<ResponseTempCVUploadDto> {
  @ApiProperty({ type: ResponseTempCVUploadDto })
  declare data: ResponseTempCVUploadDto;
}

export class ResponseTempCVPreviewDto {
  @ApiProperty()
  tempFileKey: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty({ enum: ['pdf', 'docx', 'doc'] })
  fileExtension: 'pdf' | 'docx' | 'doc';

  @ApiProperty()
  expiresInSeconds: number;

  @ApiProperty({ type: ResponseCVAnalysisDto })
  analysis: ResponseCVAnalysisDto;
}

export class ResponseApiTempCVPreviewDto extends ApiResponseDto<ResponseTempCVPreviewDto> {
  @ApiProperty({ type: ResponseTempCVPreviewDto })
  declare data: ResponseTempCVPreviewDto;
}

export class ResponseTempCVSaveDto extends ResponseCVAnalysisDto {
  @ApiProperty()
  savedCvId: string;
}

export class ResponseApiTempCVSaveDto extends ApiResponseDto<ResponseTempCVSaveDto> {
  @ApiProperty({ type: ResponseTempCVSaveDto })
  declare data: ResponseTempCVSaveDto;
}
