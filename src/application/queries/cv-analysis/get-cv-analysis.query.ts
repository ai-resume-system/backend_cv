import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiCVAnalysisDto } from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

interface IParsedAnalysisPayload {
  skills?: Array<{
    name?: string;
    normalizedName?: string;
    confidence?: number;
    skillId?: string;
  }>;
  education?: Array<Record<string, unknown>>;
  experience?: Array<Record<string, unknown>>;
  suggestions?: string[];
  score?: number;
}

@Injectable()
export class GetCVAnalysisQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetCVAnalysisQuery.name));
  }

  async execute(
    id: string,
    userId: string,
  ): Promise<IResponseApiCVAnalysisDto> {
    return this.runSafe('[Get CV Analysis]:', async () => {
      const cv = await this.cvRepository.findById(id);
      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const parsedData = await this.cvParsedDataRepository.findLatestByCvId(cv.id);
      const snapshotUpdatedAt = parsedData?.updatedAt || cv.updatedAt;
      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.CV_DETAIL);
      const cacheKey = `${CACHE_KEYS.CV_DETAIL}:analysis:v${version}:${cv.id}:${snapshotUpdatedAt.getTime()}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiCVAnalysisDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const cvSkills = await this.cvSkillRepository.findByCvId(cv.id);
      const parsedJson = (parsedData?.parsedJson ||
        {}) as IParsedAnalysisPayload;
      const skillNames = await Promise.all(
        cvSkills.map(async (cvSkill) => {
          const skill = await this.skillRepository.findById(cvSkill.skillId);
          return {
            skillId: cvSkill.skillId,
            name: skill?.name || cvSkill.skillId,
            normalizedName: (skill?.name || cvSkill.skillId).toLowerCase(),
            confidence: cvSkill.confidenceScore,
          };
        }),
      );

      const parsedSkills = Array.isArray(parsedJson.skills)
        ? parsedJson.skills.map((skill) => ({
            name: skill.name || skill.normalizedName || '',
            normalizedName:
              skill.normalizedName ||
              String(skill.name || '')
                .toLowerCase()
                .trim(),
            confidence: skill.confidence,
            skillId: skill.skillId,
          }))
        : [];

      const response: IResponseApiCVAnalysisDto = {
        data: {
          cvId: cv.id,
          processingStatus:
            parsedData?.processingStatus || EProcessingStatus.PENDING,
          summary: parsedData?.summary,
          score:
            parsedData?.score ??
            (typeof parsedJson.score === 'number'
              ? parsedJson.score
              : undefined),
          skills: skillNames.length ? skillNames : parsedSkills,
          education: Array.isArray(parsedJson.education)
            ? parsedJson.education
            : [],
          experience: Array.isArray(parsedJson.experience)
            ? parsedJson.experience
            : [],
          suggestions: Array.isArray(parsedJson.suggestions)
            ? parsedJson.suggestions
            : [],
          rawText: parsedData?.rawText,
          parsedDataId: parsedData?.id,
          provider: parsedData?.provider,
          model: parsedData?.model,
          confidenceFlags: parsedData?.confidenceFlags || [],
          updatedAt: snapshotUpdatedAt,
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
