import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiJobMatchDto } from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

interface IParsedJson {
  careerCategorySuggestion?: { slug?: string };
  primaryRole?: string;
  relatedJobTitles?: string[];
  keywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
  improvementSuggestions?: string[];
  fingerprint?: string;
  experience?: Array<{ durationMonths?: number }>;
}

@Injectable()
export class GetJobMatchQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    @Inject('IJobSkillRepository')
    private readonly jobSkillRepository: IJobSkillRepository,
    @Inject('ISkillRepository') private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetJobMatchQuery.name));
  }

  async execute(
    slug: string,
    cvId: string,
    userId: string,
  ): Promise<IResponseApiJobMatchDto> {
    return this.runSafe('[Get Job Match]:', async () => {
      const [job, cv] = await Promise.all([
        this.jobRepository.findBySlug(slug),
        this.cvRepository.findById(cvId),
      ]);

      if (
        !job ||
        job.status !== EJobStatus.OPEN ||
        (job.expiredAt && job.expiredAt <= new Date())
      ) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const parsedData = await this.cvParsedDataRepository.findLatestByCvId(cvId);
      if (
        !parsedData ||
        parsedData.processingStatus !== EProcessingStatus.COMPLETED ||
        !parsedData.parsedJson
      ) {
        throw new AppException(ERROR_CODES.CV_ANALYSIS_NOT_READY);
      }

      const parsedJson = parsedData.parsedJson as IParsedJson;
      const jobDetailVersion = await this.redis.getVersion(
        CACHE_VERSION_KEYS.JOB_DETAIL,
      );
      const cvDetailVersion = await this.redis.getVersion(
        CACHE_VERSION_KEYS.CV_DETAIL,
      );
      const fingerprint = parsedJson.fingerprint || parsedData.updatedAt.getTime();
      const cacheKey = `${CACHE_KEYS.JOB_DETAIL}:match:v${jobDetailVersion}:${cvDetailVersion}:${job.id}:${cv.id}:${fingerprint}`;
      const cached = await this.redis.safeGetJson<IResponseApiJobMatchDto>(
        cacheKey,
      );
      if (cached) {
        return cached;
      }

      const [cvSkills, jobSkills] = await Promise.all([
        this.cvSkillRepository.findByCvId(cvId),
        this.jobSkillRepository.findByJobId(job.id),
      ]);

      const cvSkillIds = new Set(cvSkills.map((item) => item.skillId));
      const allSkillIds = [
        ...new Set([
          ...cvSkills.map((item) => item.skillId),
          ...jobSkills.map((item) => item.skillId),
        ]),
      ];
      const skills = await this.skillRepository.findByIds(allSkillIds);
      const skillMap = new Map(skills.map((skill) => [skill.id, skill]));

      const totalWeight = jobSkills.reduce(
        (sum, item) => sum + Number(item.weight || 1),
        0,
      );
      const matchedJobSkills = jobSkills.filter((item) => cvSkillIds.has(item.skillId));
      const matchedWeight = matchedJobSkills.reduce(
        (sum, item) => sum + Number(item.weight || 1),
        0,
      );
      const skillMatch = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
      const categoryMatch =
        parsedJson.careerCategorySuggestion?.slug &&
        job.careerCategoryId &&
        skills.find(
          (skill) =>
            skill.careerCategoryId === job.careerCategoryId &&
            cvSkillIds.has(skill.id),
        )
          ? 100
          : parsedJson.careerCategorySuggestion?.slug
            ? 60
            : 0;
      const experienceMonths = (parsedJson.experience || []).reduce(
        (sum, item) => sum + Number(item.durationMonths || 0),
        0,
      );
      const experienceYears = experienceMonths > 0 ? experienceMonths / 12 : 0;
      const requiredYears = Number(job.experienceYears || 0);
      const experienceMatch =
        requiredYears <= 0
          ? 100
          : Math.min(100, (experienceYears / requiredYears) * 100);
      const titleKeywordTokens = new Set<string>(
        [
          ...(parsedJson.relatedJobTitles || []),
          ...(parsedJson.keywords || []),
          parsedJson.primaryRole || '',
        ]
          .flatMap((value) => value.toLowerCase().split(/[^a-z0-9+#.]+/i))
          .filter(Boolean),
      );
      const jobTokens = new Set<string>(
        `${job.title} ${job.shortDescription || ''} ${job.description || ''}`
          .toLowerCase()
          .split(/[^a-z0-9+#.]+/i)
          .filter(Boolean),
      );
      const keywordOverlap = Array.from(titleKeywordTokens).filter((token) =>
        jobTokens.has(token),
      ).length;
      const titleKeywordSimilarity =
        titleKeywordTokens.size > 0
          ? Math.min(100, (keywordOverlap / titleKeywordTokens.size) * 100)
          : 0;
      const preferenceMatch = 100;
      const matchScore =
        skillMatch * 0.5 +
        categoryMatch * 0.2 +
        experienceMatch * 0.15 +
        titleKeywordSimilarity * 0.1 +
        preferenceMatch * 0.05;

      const response: IResponseApiJobMatchDto = {
        data: {
          cvId: cv.id,
          jobId: job.id,
          jobSlug: job.slug,
          matchScore: Number(matchScore.toFixed(2)),
          breakdown: {
            skillMatch: Number(skillMatch.toFixed(2)),
            careerCategoryMatch: Number(categoryMatch.toFixed(2)),
            experienceMatch: Number(experienceMatch.toFixed(2)),
            titleKeywordSimilarity: Number(titleKeywordSimilarity.toFixed(2)),
            preferenceMatch: Number(preferenceMatch.toFixed(2)),
          },
          matchedSkills: matchedJobSkills.map((item) => {
            const skill = skillMap.get(item.skillId);
            const cvSkill = cvSkills.find((existing) => existing.skillId === item.skillId);
            return {
              name: skill?.name || item.skillId,
              normalizedName: skill?.slug || item.skillId,
              systemSkillSlug: skill?.slug,
              confidence: cvSkill?.confidenceScore,
            };
          }),
          missingSkills: jobSkills
            .filter((item) => !cvSkillIds.has(item.skillId))
            .map((item) => {
              const skill = skillMap.get(item.skillId);
              return {
                id: skill?.id || item.skillId,
                name: skill?.name || item.skillId,
                slug: skill?.slug || item.skillId,
                weight: item.weight,
              };
            }),
          strengths: parsedJson.strengths || [],
          risks: parsedJson.weaknesses || [],
          improvementSuggestions: parsedJson.improvementSuggestions || [],
          computedAt: new Date(),
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
