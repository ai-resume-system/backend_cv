import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';
import type {
  IAiAnalysisEducation,
  IAiAnalysisExperience,
  IAiAnalysisProject,
  IAiAnalysisScoreBreakdown,
} from 'src/infrastructure/ai/ai-analysis.types';

export interface ICVAnalysisMatchedSkillDto {
  name: string;
  normalizedName: string;
  systemSkillSlug?: string;
  confidence?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
  evidence?: string;
  skillId?: string;
}

export interface ICVAnalysisOtherSkillDto {
  name: string;
  normalizedName: string;
  confidence?: number;
  evidence?: string;
}

export interface ICVAnalysisCareerCategorySuggestionDto {
  name: string;
  slug: string;
  confidence: number;
}

export interface ICVAnalysisResultDto {
  cvId: string;
  processingStatus: EProcessingStatus;
  summary?: string;
  resumeQualityScore?: number;
  scoreBreakdown: IAiAnalysisScoreBreakdown;
  matchedSkills: ICVAnalysisMatchedSkillDto[];
  otherDetectedSkills: ICVAnalysisOtherSkillDto[];
  improvementSuggestions: string[];
  education: IAiAnalysisEducation[];
  experience: IAiAnalysisExperience[];
  updatedAt: Date;
}

export interface ICVAnalysisInternalSnapshotDto {
  cvId: string;
  processingStatus: EProcessingStatus;
  summary?: string;
  resumeQualityScore?: number;
  scoreBreakdown: IAiAnalysisScoreBreakdown;
  primaryRole?: string;
  seniorityLevel?:
    | 'intern'
    | 'fresher'
    | 'junior'
    | 'middle'
    | 'senior'
    | 'lead'
    | 'manager'
    | 'unknown';
  careerCategorySuggestion?: ICVAnalysisCareerCategorySuggestionDto;
  matchedSkills: ICVAnalysisMatchedSkillDto[];
  otherDetectedSkills: ICVAnalysisOtherSkillDto[];
  keywords: string[];
  relatedJobTitles: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  education: IAiAnalysisEducation[];
  experience: IAiAnalysisExperience[];
  projects: IAiAnalysisProject[];
  atsNotes: string[];
  rawText?: string;
  parsedDataId?: string;
  provider?: string;
  model?: string;
  confidenceFlags: string[];
  fingerprint?: string;
  updatedAt: Date;
}

export interface ICVAnalyzeActionResultDto {
  cvId: string;
  processingStatus: EProcessingStatus;
  message: string;
  reusedExistingResult?: boolean;
}

export interface ITempCVUploadResultDto {
  tempFileKey: string;
  fileName: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
  expiresInSeconds: number;
}

export interface ITempCVPreviewResultDto {
  tempFileKey: string;
  fileName: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
  expiresInSeconds: number;
  analysis: ICVAnalysisResultDto;
}

export interface ITempCVSaveResultDto extends ICVAnalysisResultDto {
  savedCvId: string;
}

export interface IResponseApiCVAnalysisDto
  extends IApiResponse<ICVAnalysisResultDto> {
  data: ICVAnalysisResultDto;
}

export interface IResponseApiCVAnalyzeActionDto
  extends IApiResponse<ICVAnalyzeActionResultDto> {
  data: ICVAnalyzeActionResultDto;
}

export interface IResponseApiTempCVUploadDto
  extends IApiResponse<ITempCVUploadResultDto> {
  data: ITempCVUploadResultDto;
}

export interface IResponseApiTempCVPreviewDto
  extends IApiResponse<ITempCVPreviewResultDto> {
  data: ITempCVPreviewResultDto;
}

export interface IResponseApiTempCVSaveDto
  extends IApiResponse<ITempCVSaveResultDto> {
  data: ITempCVSaveResultDto;
}
