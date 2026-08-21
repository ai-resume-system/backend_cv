import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { IAiAnalysisRequest, IAiAnalysisResult } from './ai-analysis.types';
import { CVAnalysisNormalizerService } from './cv-analysis-normalizer.service';

interface IAiServiceResponse {
  data?: IAiAnalysisResult;
}

@Injectable()
export class AiCvAnalysisClient {
  private readonly logger = new Logger(AiCvAnalysisClient.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly normalizer: CVAnalysisNormalizerService,
  ) {}

  async analyze(request: IAiAnalysisRequest): Promise<IAiAnalysisResult> {
    const baseUrl = this.configService.get<string>('ai.baseUrl');
    if (!baseUrl) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    const timeoutMs = this.configService.get<number>('ai.timeoutMs');
    const apiKey = this.configService.get<string>('ai.apiKey');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/internal/cv/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-internal-api-key': apiKey } : {}),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(
          `AI service responded ${response.status} for CV ${request.cvId}: ${errorText}`,
        );
        throw new AppException(ERROR_CODES.SYSTEM_BUSY);
      }

      const json = (await response.json()) as IAiServiceResponse;
      const validated = this.validateResponse(json?.data);
      return this.normalizer.normalize(validated);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Unknown AI service error';
      this.logger.warn(
        `AI service analyze failed for ${request.cvId}: ${message}`,
      );
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    } finally {
      clearTimeout(timeout);
    }
  }

  private validateResponse(data?: IAiAnalysisResult): IAiAnalysisResult {
    if (!data || typeof data !== 'object') {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    if (!Array.isArray(data.matchedSkills)) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    if (!Array.isArray(data.education) || !Array.isArray(data.experience)) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    if (
      !Array.isArray(data.improvementSuggestions) ||
      !Array.isArray(data.otherDetectedSkills) ||
      !Array.isArray(data.projects)
    ) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    return {
      summary: String(data.summary || ''),
      resumeQualityScore:
        typeof data.resumeQualityScore === 'number'
          ? data.resumeQualityScore
          : 0,
      scoreBreakdown: data.scoreBreakdown || {
        roleClarity: 0,
        skillCoverage: 0,
        experienceQuality: 0,
        impactEvidence: 0,
        educationRelevance: 0,
        atsReadiness: 0,
        presentationClarity: 0,
      },
      primaryRole: data.primaryRole,
      seniorityLevel: data.seniorityLevel,
      careerCategorySuggestion: data.careerCategorySuggestion,
      matchedSkills: data.matchedSkills,
      otherDetectedSkills: data.otherDetectedSkills,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      relatedJobTitles: Array.isArray(data.relatedJobTitles)
        ? data.relatedJobTitles
        : [],
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      improvementSuggestions: data.improvementSuggestions,
      education: data.education,
      experience: data.experience,
      projects: data.projects,
      atsNotes: Array.isArray(data.atsNotes) ? data.atsNotes : [],
      provider: data.provider,
      model: data.model,
      confidenceFlags: data.confidenceFlags,
    };
  }
}
