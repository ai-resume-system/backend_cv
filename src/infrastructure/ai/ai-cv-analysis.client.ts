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

    if (!Array.isArray(data.skills)) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    if (!Array.isArray(data.education) || !Array.isArray(data.experience)) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    if (!Array.isArray(data.suggestions)) {
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }

    return {
      summary: String(data.summary || ''),
      score: typeof data.score === 'number' ? data.score : 0,
      skills: data.skills,
      education: data.education,
      experience: data.experience,
      suggestions: data.suggestions,
      provider: data.provider,
      model: data.model,
      confidenceFlags: data.confidenceFlags,
    };
  }
}
