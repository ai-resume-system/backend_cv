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
  resumeQualityScore?: number;
  scoreBreakdown?: {
    roleClarity?: number;
    skillCoverage?: number;
    experienceQuality?: number;
    impactEvidence?: number;
    educationRelevance?: number;
    atsReadiness?: number;
    presentationClarity?: number;
  };
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
  careerCategorySuggestion?: {
    name?: string;
    slug?: string;
    confidence?: number;
  };
  matchedSkills?: Array<{
    name?: string;
    normalizedName?: string;
    confidence?: number;
    systemSkillSlug?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
    evidence?: string;
    skillId?: string;
  }>;
  otherDetectedSkills?: Array<{
    name?: string;
    normalizedName?: string;
    confidence?: number;
    evidence?: string;
  }>;
  keywords?: string[];
  relatedJobTitles?: string[];
  strengths?: string[];
  weaknesses?: string[];
  improvementSuggestions?: string[];
  education?: Array<Record<string, unknown>>;
  experience?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  atsNotes?: string[];
  fingerprint?: string;
}

const EMPTY_SCORE_BREAKDOWN = {
  roleClarity: 0,
  skillCoverage: 0,
  experienceQuality: 0,
  impactEvidence: 0,
  educationRelevance: 0,
  atsReadiness: 0,
  presentationClarity: 0,
};

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

      const parsedSkills = Array.isArray(parsedJson.matchedSkills)
        ? parsedJson.matchedSkills.map((skill) => ({
            name: skill.name || skill.normalizedName || '',
            normalizedName:
              skill.normalizedName ||
              String(skill.name || '')
                .toLowerCase()
                .trim(),
            confidence: skill.confidence,
            systemSkillSlug: skill.systemSkillSlug,
            level: skill.level,
            evidence: skill.evidence,
            skillId: skill.skillId,
          }))
        : [];

      const response: IResponseApiCVAnalysisDto = {
        data: {
          cvId: cv.id,
          processingStatus:
            parsedData?.processingStatus || EProcessingStatus.PENDING,
          summary: parsedData?.summary,
          resumeQualityScore:
            parsedData?.score ??
            (typeof parsedJson.resumeQualityScore === 'number'
              ? parsedJson.resumeQualityScore
              : undefined),
          scoreBreakdown: parsedJson.scoreBreakdown
            ? {
            roleClarity: Number(parsedJson.scoreBreakdown?.roleClarity || 0),
            skillCoverage: Number(parsedJson.scoreBreakdown?.skillCoverage || 0),
            experienceQuality: Number(
              parsedJson.scoreBreakdown?.experienceQuality || 0,
            ),
            impactEvidence: Number(
              parsedJson.scoreBreakdown?.impactEvidence || 0,
            ),
            educationRelevance: Number(
              parsedJson.scoreBreakdown?.educationRelevance || 0,
            ),
            atsReadiness: Number(parsedJson.scoreBreakdown?.atsReadiness || 0),
            presentationClarity: Number(
              parsedJson.scoreBreakdown?.presentationClarity || 0,
            ),
              }
            : EMPTY_SCORE_BREAKDOWN,
          matchedSkills: skillNames.length
            ? skillNames.map((skill) => ({
                ...skill,
                systemSkillSlug: skill.normalizedName,
                level: 'unknown' as const,
              }))
            : parsedSkills,
          improvementSuggestions: Array.isArray(
            parsedJson.improvementSuggestions,
          )
            ? parsedJson.improvementSuggestions
            : [],
          education: Array.isArray(parsedJson.education)
            ? parsedJson.education
            : [],
          experience: Array.isArray(parsedJson.experience)
            ? parsedJson.experience
            : [],
          updatedAt: snapshotUpdatedAt,
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
