import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface ICVAnalysisSkillDto {
  name: string;
  normalizedName: string;
  confidence?: number;
  skillId?: string;
}

export interface ICVAnalysisEducationDto {
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ICVAnalysisExperienceDto {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ICVAnalysisResultDto {
  cvId: string;
  processingStatus: EProcessingStatus;
  summary?: string;
  score?: number;
  skills: ICVAnalysisSkillDto[];
  education: ICVAnalysisEducationDto[];
  experience: ICVAnalysisExperienceDto[];
  suggestions: string[];
  rawText?: string;
  parsedDataId?: string;
  provider?: string;
  model?: string;
  confidenceFlags: string[];
  updatedAt: Date;
}

export interface ICVAnalyzeActionResultDto {
  cvId: string;
  processingStatus: EProcessingStatus;
  message: string;
}

export interface IResponseApiCVAnalysisDto extends IApiResponse<ICVAnalysisResultDto> {
  data: ICVAnalysisResultDto;
}

export interface IResponseApiCVAnalyzeActionDto extends IApiResponse<ICVAnalyzeActionResultDto> {
  data: ICVAnalyzeActionResultDto;
}
