import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICalculateJobMatchDto } from 'src/application/dtos/job/req.job.dto';
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
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { IJobMatchRepository } from 'src/domain/repositories/job-match.repository.interface';
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
  matchedSkills?: Array<{ name?: string; normalizedName?: string }>;
  otherDetectedSkills?: Array<{ name?: string; normalizedName?: string }>;
}

interface ISavedJobMatchDetails {
  jobSlug?: string;
  breakdown?: IResponseApiJobMatchDto['data']['breakdown'];
  matchedSkills?: IResponseApiJobMatchDto['data']['matchedSkills'];
  missingSkills?: IResponseApiJobMatchDto['data']['missingSkills'];
  strengths?: string[];
  risks?: string[];
  improvementSuggestions?: string[];
  computedAt?: string | Date;
}

@Injectable()
export class CalculateJobMatchUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IJobSkillRepository')
    private readonly jobSkillRepository: IJobSkillRepository,
    @Inject('IJobMatchRepository')
    private readonly jobMatchRepository: IJobMatchRepository,
    @Inject('ISkillRepository') private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(CalculateJobMatchUseCase.name));
  }

  async execute(
    slug: string,
    dto: ICalculateJobMatchDto,
    userId: string,
  ): Promise<IResponseApiJobMatchDto> {
    return this.runSafe('[Calculate Job Match]:', async () => {
      const [job, cv] = await Promise.all([
        this.jobRepository.findBySlug(slug),
        this.cvRepository.findById(dto.cvId),
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

      const parsedData = await this.cvParsedDataRepository.findLatestByCvId(cv.id);
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
      const cached = await this.redis.safeGetJson<IResponseApiJobMatchDto>(cacheKey);
      if (cached) {
        await this.saveMatchResult(cv.id, job.id, cached);
        return cached;
      }

      const [cvSkills, jobSkills] = await Promise.all([
        this.cvSkillRepository.findByCvId(cv.id),
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
      const matchedJobSkills = jobSkills.filter((item) =>
        cvSkillIds.has(item.skillId),
      );
      const matchedWeight = matchedJobSkills.reduce(
        (sum, item) => sum + Number(item.weight || 1),
        0,
      );
      const skillMatch = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
      const jobCategory = job.careerCategoryId
        ? await this.careerCategoryRepository.findById(job.careerCategoryId)
        : null;
      const hasCvSkillInJobCategory = !!job.careerCategoryId &&
        skills.some(
          (skill) =>
            skill.careerCategoryId === job.careerCategoryId &&
            cvSkillIds.has(skill.id),
        );
      const categoryMatch = this.calculateCategoryMatch(
        parsedJson.careerCategorySuggestion?.slug,
        jobCategory?.slug,
        hasCvSkillInJobCategory,
      );
      const experienceMonths = (parsedJson.experience || []).reduce(
        (sum, item) => sum + Number(item.durationMonths || 0),
        0,
      );
      const experienceYears = experienceMonths > 0 ? experienceMonths / 12 : 0;
      const requiredYears = Number(job.experienceYears || 0);
      const experienceMatch =
        requiredYears <= 0
          ? 100
          : experienceYears > 0
            ? Math.min(100, (experienceYears / requiredYears) * 100)
            : (parsedJson.experience || []).length > 0
              ? 50
              : 0;
      const titleKeywordTokens = new Set<string>(
        [
          ...(parsedJson.relatedJobTitles || []),
          ...(parsedJson.keywords || []),
          parsedJson.primaryRole || '',
          ...(parsedJson.matchedSkills || []).map(
            (skill) => skill.normalizedName || skill.name || '',
          ),
          ...(parsedJson.otherDetectedSkills || []).map(
            (skill) => skill.normalizedName || skill.name || '',
          ),
        ]
          .flatMap((value) => value.toLowerCase().split(/[^a-z0-9+#.]+/i))
          .filter(Boolean),
      );
      const jobTokens = new Set<string>(
        `${job.title} ${job.shortDescription || ''} ${job.description || ''} ${jobSkills
          .map((item) => skillMap.get(item.skillId)?.name || '')
          .join(' ')}`
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
      const matchScore =
        skillMatch * 0.55 +
        experienceMatch * 0.2 +
        categoryMatch * 0.15 +
        titleKeywordSimilarity * 0.1;

      const missingSkills = jobSkills
        .filter((item) => !cvSkillIds.has(item.skillId))
        .map((item) => {
          const skill = skillMap.get(item.skillId);
          return {
            id: skill?.id || item.skillId,
            name: skill?.name || item.skillId,
            slug: skill?.slug || item.skillId,
            weight: item.weight,
          };
        });
      const matchedSkillNames = matchedJobSkills
        .map((item) => skillMap.get(item.skillId)?.name)
        .filter((name): name is string => !!name);

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
          },
          matchedSkills: matchedJobSkills.map((item) => {
            const skill = skillMap.get(item.skillId);
            const cvSkill = cvSkills.find(
              (existing) => existing.skillId === item.skillId,
            );

            return {
              name: skill?.name || item.skillId,
              normalizedName: skill?.slug || item.skillId,
              systemSkillSlug: skill?.slug,
              confidence: cvSkill?.confidenceScore,
            };
          }),
          missingSkills,
          strengths: this.buildStrengths(
            matchedSkillNames,
            categoryMatch,
            experienceMatch,
          ),
          risks: this.buildRisks(missingSkills.map((skill) => skill.name), experienceMatch),
          improvementSuggestions: this.buildImprovementSuggestions(
            missingSkills.map((skill) => skill.name),
            experienceMatch,
          ),
          computedAt: new Date(),
        },
      };

      await this.saveMatchResult(cv.id, job.id, response);
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }

  private calculateCategoryMatch(
    cvCategorySlug?: string,
    jobCategorySlug?: string,
    hasCvSkillInJobCategory = false,
  ): number {
    if (cvCategorySlug && jobCategorySlug && cvCategorySlug === jobCategorySlug) {
      return 100;
    }

    if (!cvCategorySlug && hasCvSkillInJobCategory) {
      return 70;
    }

    if (cvCategorySlug && jobCategorySlug && cvCategorySlug !== jobCategorySlug) {
      return 40;
    }

    return 0;
  }

  private buildStrengths(
    matchedSkillNames: string[],
    categoryMatch: number,
    experienceMatch: number,
  ): string[] {
    const strengths: string[] = [];
    if (matchedSkillNames.length) {
      strengths.push(
        `CV có kỹ năng phù hợp: ${matchedSkillNames.slice(0, 5).join(', ')}.`,
      );
    }
    if (categoryMatch >= 70) {
      strengths.push('Ngành nghề hoặc nhóm kỹ năng trong CV phù hợp với tin tuyển dụng.');
    }
    if (experienceMatch >= 80) {
      strengths.push('Kinh nghiệm trong CV đáp ứng tốt yêu cầu của công việc.');
    }
    return strengths;
  }

  private buildRisks(missingSkillNames: string[], experienceMatch: number): string[] {
    const risks: string[] = [];
    if (missingSkillNames.length) {
      risks.push(
        `CV chưa thể hiện rõ các kỹ năng: ${missingSkillNames.slice(0, 5).join(', ')}.`,
      );
    }
    if (experienceMatch < 60) {
      risks.push('Kinh nghiệm trong CV thấp hơn yêu cầu của tin tuyển dụng.');
    }
    return risks;
  }

  private buildImprovementSuggestions(
    missingSkillNames: string[],
    experienceMatch: number,
  ): string[] {
    const suggestions: string[] = [];
    if (missingSkillNames.length) {
      suggestions.push(
        `Bổ sung dự án hoặc kinh nghiệm thực tế liên quan đến ${missingSkillNames
          .slice(0, 5)
          .join(', ')} nếu bạn đã từng sử dụng.`,
      );
    }
    if (experienceMatch < 60) {
      suggestions.push('Làm rõ thời gian, vai trò và kết quả đạt được trong các kinh nghiệm liên quan.');
    }
    return suggestions;
  }

  private async saveMatchResult(
    cvId: string,
    jobId: string,
    response: IResponseApiJobMatchDto,
  ): Promise<void> {
    const details: ISavedJobMatchDetails = {
      jobSlug: response.data.jobSlug,
      breakdown: response.data.breakdown,
      matchedSkills: response.data.matchedSkills,
      missingSkills: response.data.missingSkills,
      strengths: response.data.strengths,
      risks: response.data.risks,
      improvementSuggestions: response.data.improvementSuggestions,
      computedAt: response.data.computedAt,
    };

    await this.jobMatchRepository.upsertByCvIdAndJobId(cvId, jobId, {
      matchScore: response.data.matchScore,
      matchedSkills: details as Record<string, unknown>,
    });
  }
}
