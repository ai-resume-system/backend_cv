import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { IPreviewTempCVAnalysisDto } from 'src/application/dtos/cv-analysis/req.cv-analysis.dto';
import {
  ICVAnalysisInternalSnapshotDto,
  ICVAnalysisResultDto,
  IResponseApiTempCVPreviewDto,
} from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { AiCvAnalysisClient } from 'src/infrastructure/ai/ai-cv-analysis.client';
import type {
  IAiAnalysisRequest,
  IAiAnalysisResult,
  IAiSkillContext,
} from 'src/infrastructure/ai/ai-analysis.types';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { CvParserService } from 'src/infrastructure/storage/cv-parser.service';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

const TEMP_CV_ANALYSIS_TTL_SECONDS = 2 * 60 * 60;

interface ITempFileMetadata {
  userId: string;
  objectKey: string;
  fileName: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
  uploadedAt: string;
}

@Injectable()
export class PreviewTempCVAnalysisUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly storage: S3StorageService,
    private readonly parser: CvParserService,
    private readonly aiClient: AiCvAnalysisClient,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(PreviewTempCVAnalysisUseCase.name));
  }

  async execute(
    userId: string,
    dto: IPreviewTempCVAnalysisDto,
  ): Promise<IResponseApiTempCVPreviewDto> {
    return this.runSafe(
      '[Preview Temp CV Analysis]:',
      async () => {
        const metadata = await this.getTempMetadata(dto.tempFileKey, userId);
        const buffer = await this.storage.getPrivateObjectBuffer(
          metadata.objectKey,
          EBucketType.CV,
        );
        const rawText = await this.parser.parse(buffer, metadata.fileExtension);
        const fingerprint = this.buildFingerprint(rawText);
        const request = await this.buildAnalysisRequest(
          dto.tempFileKey,
          rawText,
          metadata.fileExtension,
          dto.requestedProvider,
        );
        const verifiedAnalysis = this.verifyAnalysis(
          await this.aiClient.analyze(request),
          request,
          fingerprint,
        );
        const internalAnalysis = this.toInternalAnalysisDto(
          dto.tempFileKey,
          verifiedAnalysis,
          rawText,
          fingerprint,
        );

        await this.redis.safeSetJson(
          this.buildPreviewKey(dto.tempFileKey),
          internalAnalysis,
          TEMP_CV_ANALYSIS_TTL_SECONDS,
        );

        return {
          data: {
            tempFileKey: dto.tempFileKey,
            fileName: metadata.fileName,
            fileExtension: metadata.fileExtension,
            expiresInSeconds: TEMP_CV_ANALYSIS_TTL_SECONDS,
            analysis: this.toPublicAnalysisDto(internalAnalysis),
          },
        };
      },
      ERROR_CODES.CV_ANALYSIS_TRIGGER_FAILED_ERROR,
    );
  }

  private async buildAnalysisRequest(
    cvId: string,
    rawText: string,
    fileExtension: 'pdf' | 'docx' | 'doc',
    requestedProvider?: IPreviewTempCVAnalysisDto['requestedProvider'],
  ): Promise<IAiAnalysisRequest> {
    const [careerCategories, allSkills] = await Promise.all([
      this.careerCategoryRepository.findActive({
        pagination: { page: 1, limit: 50 },
      }),
      this.skillRepository.findAll({
        sort: { sortBy: 'name', sortOrder: 'ASC' },
      }),
    ]);

    const candidateSkills = this.selectCandidateSkills(rawText, allSkills).slice(
      0,
      300,
    );

    return {
      cvId,
      rawText: this.parser.summarize(rawText, 12000),
      fileExtension,
      requestedProvider,
      availableCareerCategories: careerCategories.data.map((category) => ({
        name: category.name,
        slug: category.slug,
      })),
      availableSkills: candidateSkills.map((skill) => ({
        name: skill.name,
        slug: skill.slug,
        aliases: this.buildSkillAliases(skill.name, skill.slug),
      })),
    };
  }

  private async getTempMetadata(
    tempFileKey: string,
    userId: string,
  ): Promise<ITempFileMetadata> {
    const metadata = await this.redis.safeGetJson<ITempFileMetadata>(
      this.buildTempFileKey(tempFileKey),
    );

    if (!metadata || metadata.userId !== userId) {
      throw new AppException(ERROR_CODES.CV_ANALYSIS_TEMP_FILE_NOT_FOUND);
    }

    return metadata;
  }

  private buildTempFileKey(tempFileKey: string): string {
    return `cv:analysis:temp:file:${tempFileKey}`;
  }

  private buildPreviewKey(tempFileKey: string): string {
    return `cv:analysis:temp:preview:${tempFileKey}`;
  }

  private buildFingerprint(rawText: string): string {
    return createHash('sha256')
      .update(this.parser.summarize(rawText, 12000))
      .digest('hex');
  }

  private selectCandidateSkills(
    rawText: string,
    skills: Awaited<ReturnType<ISkillRepository['findAll']>>,
  ) {
    const haystack = rawText.toLowerCase();
    const matched = skills.filter((skill) => {
      const aliases = this.buildSkillAliases(skill.name, skill.slug);
      return aliases.some((alias) => haystack.includes(alias.toLowerCase()));
    });

    return matched.length ? matched : skills.slice(0, 300);
  }

  private buildSkillAliases(name: string, slug: string): string[] {
    const aliases = new Set<string>([
      name,
      slug,
      slug.replace(/-/g, ' '),
      name.toLowerCase(),
    ]);
    if (slug.endsWith('js')) {
      aliases.add(slug.replace(/js$/, '.js'));
      aliases.add(slug.replace(/js$/, ' js'));
    }
    return Array.from(aliases).filter(Boolean);
  }

  private verifyAnalysis(
    analysis: IAiAnalysisResult,
    request: IAiAnalysisRequest,
    fingerprint: string,
  ): IAiAnalysisResult {
    const allowedCategorySlugs = new Set(
      (request.availableCareerCategories || []).map((item) => item.slug),
    );
    const allowedSkills = new Map<string, IAiSkillContext>(
      (request.availableSkills || []).map((item) => [item.slug, item]),
    );

    const verifiedMatchedSkills = analysis.matchedSkills.filter(
      (skill) =>
        !!skill.systemSkillSlug && allowedSkills.has(skill.systemSkillSlug),
    );
    const demotedSkills = analysis.matchedSkills
      .filter(
        (skill) =>
          !skill.systemSkillSlug || !allowedSkills.has(skill.systemSkillSlug),
      )
      .map((skill) => ({
        name: skill.name,
        normalizedName: skill.normalizedName,
        confidence: skill.confidence,
        evidence: skill.evidence,
      }));

    return {
      ...analysis,
      careerCategorySuggestion:
        analysis.careerCategorySuggestion &&
        allowedCategorySlugs.has(analysis.careerCategorySuggestion.slug)
          ? analysis.careerCategorySuggestion
          : undefined,
      matchedSkills: verifiedMatchedSkills,
      otherDetectedSkills: [
        ...analysis.otherDetectedSkills,
        ...demotedSkills,
      ].slice(0, 20),
      confidenceFlags: [
        ...(analysis.confidenceFlags || []),
        ...(verifiedMatchedSkills.length !== analysis.matchedSkills.length
          ? ['some_skills_were_not_verified_against_system_catalog']
          : []),
      ],
    };
  }

  private toInternalAnalysisDto(
    tempFileKey: string,
    analysis: IAiAnalysisResult,
    rawText: string,
    fingerprint: string,
  ): ICVAnalysisInternalSnapshotDto {
    return {
      cvId: tempFileKey,
      processingStatus: EProcessingStatus.COMPLETED,
      summary: analysis.summary,
      resumeQualityScore: analysis.resumeQualityScore,
      scoreBreakdown: analysis.scoreBreakdown,
      primaryRole: analysis.primaryRole,
      seniorityLevel: analysis.seniorityLevel || 'unknown',
      careerCategorySuggestion: analysis.careerCategorySuggestion,
      matchedSkills: analysis.matchedSkills.map((skill) => ({
        ...skill,
        skillId: undefined,
      })),
      otherDetectedSkills: analysis.otherDetectedSkills,
      keywords: analysis.keywords,
      relatedJobTitles: analysis.relatedJobTitles,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      improvementSuggestions: analysis.improvementSuggestions,
      education: analysis.education,
      experience: analysis.experience,
      projects: analysis.projects,
      atsNotes: analysis.atsNotes,
      rawText,
      parsedDataId: undefined,
      provider: analysis.provider,
      model: analysis.model,
      confidenceFlags: analysis.confidenceFlags || [],
      fingerprint,
      updatedAt: new Date(),
    };
  }

  private toPublicAnalysisDto(
    analysis: ICVAnalysisInternalSnapshotDto,
  ): ICVAnalysisResultDto {
    return {
      cvId: analysis.cvId,
      processingStatus: analysis.processingStatus,
      summary: analysis.summary,
      resumeQualityScore: analysis.resumeQualityScore,
      scoreBreakdown: analysis.scoreBreakdown,
      matchedSkills: analysis.matchedSkills,
      improvementSuggestions: analysis.improvementSuggestions,
      education: analysis.education,
      experience: analysis.experience,
      updatedAt: analysis.updatedAt,
    };
  }
}
