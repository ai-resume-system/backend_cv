import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ISaveTempCVAnalysisDto } from 'src/application/dtos/cv-analysis/req.cv-analysis.dto';
import {
  ICVAnalysisInternalSnapshotDto,
  ICVAnalysisResultDto,
  IResponseApiTempCVSaveDto,
} from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

interface ITempFileMetadata {
  userId: string;
  objectKey: string;
  fileName: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
  uploadedAt: string;
}

const TEMP_CV_ANALYSIS_TTL_SECONDS = 2 * 60 * 60;

@Injectable()
export class SaveTempCVAnalysisUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly storage: S3StorageService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(SaveTempCVAnalysisUseCase.name));
  }

  async execute(
    userId: string,
    dto: ISaveTempCVAnalysisDto,
  ): Promise<IResponseApiTempCVSaveDto> {
    return this.runSafe(
      '[Save Temp CV Analysis]:',
      async () => {
        const metadata = await this.redis.safeGetJson<ITempFileMetadata>(
          this.buildTempFileKey(dto.tempFileKey),
        );
        if (!metadata || metadata.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_ANALYSIS_TEMP_FILE_NOT_FOUND);
        }

        const preview =
          await this.redis.safeGetJson<ICVAnalysisInternalSnapshotDto>(
            this.buildPreviewKey(dto.tempFileKey),
          );
        if (!preview) {
          throw new AppException(ERROR_CODES.CV_ANALYSIS_PREVIEW_NOT_FOUND);
        }

        const destinationKey = `${userId}/${randomUUID()}.${metadata.fileExtension}`;
        await this.storage.moveObject(
          metadata.objectKey,
          destinationKey,
          EBucketType.CV,
        );

        const cv = await this.cvRepository.create({
          userId,
          title: dto.title?.trim() || this.removeExtension(metadata.fileName),
          fileUrl: destinationKey,
          fileExtension: metadata.fileExtension,
        });

        const parsedData = await this.cvParsedDataRepository.create({
          cvId: cv.id,
          processingStatus: EProcessingStatus.COMPLETED,
          summary: preview.summary,
          rawText: preview.rawText,
          parsedJson: {
            summary: preview.summary,
            resumeQualityScore: preview.resumeQualityScore,
            scoreBreakdown: preview.scoreBreakdown,
            primaryRole: preview.primaryRole,
            seniorityLevel: preview.seniorityLevel,
            careerCategorySuggestion: preview.careerCategorySuggestion,
            matchedSkills: preview.matchedSkills,
            otherDetectedSkills: preview.otherDetectedSkills,
            keywords: preview.keywords,
            relatedJobTitles: preview.relatedJobTitles,
            strengths: preview.strengths,
            weaknesses: preview.weaknesses,
            improvementSuggestions: preview.improvementSuggestions,
            education: preview.education,
            experience: preview.experience,
            projects: preview.projects,
            atsNotes: preview.atsNotes,
            confidenceFlags: preview.confidenceFlags,
            fingerprint: preview.fingerprint,
          },
          score: preview.resumeQualityScore || 0,
          provider: preview.provider,
          model: preview.model,
          confidenceFlags: preview.confidenceFlags,
        });

        for (const skill of preview.matchedSkills) {
          const matched = skill.systemSkillSlug
            ? await this.skillRepository.findBySlug(skill.systemSkillSlug)
            : null;
          if (!matched) {
            continue;
          }
          await this.cvSkillRepository.create({
            cvId: cv.id,
            skillId: matched.id,
            confidenceScore: skill.confidence,
          });
        }

        await this.redis.safeDel(
          this.buildTempFileKey(dto.tempFileKey),
          this.buildPreviewKey(dto.tempFileKey),
        );
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);

        return {
          data: {
            ...this.toPublicAnalysisDto(preview),
            savedCvId: cv.id,
            cvId: cv.id,
            updatedAt: parsedData.updatedAt,
          },
        };
      },
      ERROR_CODES.CV_CREATE_FAILED,
    );
  }

  private buildTempFileKey(tempFileKey: string): string {
    return `cv:analysis:temp:file:${tempFileKey}`;
  }

  private buildPreviewKey(tempFileKey: string): string {
    return `cv:analysis:temp:preview:${tempFileKey}`;
  }

  private removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').trim();
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
