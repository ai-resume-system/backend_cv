import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { Queue, Job } from 'bullmq';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
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
import { CV_PARSE_DLQ, CV_PARSE_QUEUE, ICvParseJob } from '../queue.constants';

@Processor(CV_PARSE_QUEUE)
export class CvParseProcessor extends WorkerHost {
  private readonly logger = new Logger(CvParseProcessor.name);

  constructor(
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly storage: S3StorageService,
    private readonly parser: CvParserService,
    private readonly aiClient: AiCvAnalysisClient,
    private readonly redis: RedisAdapter,
    @InjectQueue(CV_PARSE_DLQ) private readonly dlq: Queue<ICvParseJob>,
  ) {
    super();
  }

  async process(job: Job<ICvParseJob>): Promise<void> {
    try {
      const buffer = await this.withTimeout(
        this.storage.getPrivateObjectBuffer(job.data.fileKey),
        60000,
      );
      const rawText = await this.withTimeout(
        this.parser.parse(buffer, job.data.extension),
        60000,
      );
      const fingerprint = this.buildFingerprint(rawText);
      const latestParsedData =
        await this.cvParsedDataRepository.findLatestByCvId(job.data.cvId);
      const previousFingerprint = this.extractFingerprint(
        latestParsedData?.parsedJson,
      );
      if (
        latestParsedData &&
        latestParsedData.id !== job.data.parsedDataId &&
        previousFingerprint &&
        previousFingerprint === fingerprint &&
        latestParsedData.processingStatus === EProcessingStatus.COMPLETED
      ) {
        await this.cvParsedDataRepository.update(job.data.parsedDataId, {
          processingStatus: EProcessingStatus.COMPLETED,
          summary: latestParsedData.summary,
          rawText: latestParsedData.rawText,
          parsedJson: latestParsedData.parsedJson,
          score: latestParsedData.score,
          provider: latestParsedData.provider,
          model: latestParsedData.model,
          confidenceFlags: latestParsedData.confidenceFlags,
        });
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);
        return;
      }

      const request = await this.buildAnalysisRequest(
        job.data.cvId,
        rawText,
        job.data.extension,
        fingerprint,
        job.data.requestedProvider,
      );
      const analysis = await this.withTimeout(
        this.aiClient.analyze(request),
        90000,
      );
      await this.persistAnalysis(
        job.data.cvId,
        job.data.parsedDataId,
        rawText,
        this.verifyAnalysis(analysis, request, fingerprint),
      );
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);
    } catch (error) {
      this.logger.error(`CV parse failed: ${error.message}`, error.stack);
      await this.cvParsedDataRepository.update(job.data.parsedDataId, {
        processingStatus: EProcessingStatus.FAILED,
      });
      if ((job.attemptsMade || 0) + 1 >= (job.opts.attempts || 1)) {
        await this.dlq.add('parse.failed', job.data, {
          removeOnComplete: false,
        });
      }
      throw error;
    }
  }

  private async persistAnalysis(
    cvId: string,
    parsedDataId: string,
    rawText: string,
    analysis: IAiAnalysisResult,
  ): Promise<void> {
    const payload = {
      processingStatus: EProcessingStatus.COMPLETED,
      summary: analysis.summary || this.parser.summarize(rawText),
      rawText,
      parsedJson: {
        summary: analysis.summary,
        resumeQualityScore: analysis.resumeQualityScore,
        scoreBreakdown: analysis.scoreBreakdown,
        primaryRole: analysis.primaryRole,
        seniorityLevel: analysis.seniorityLevel,
        careerCategorySuggestion: analysis.careerCategorySuggestion,
        matchedSkills: analysis.matchedSkills,
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
        provider: analysis.provider,
        model: analysis.model,
        confidenceFlags: analysis.confidenceFlags || [],
        fingerprint: this.buildFingerprint(rawText),
      },
      score: analysis.resumeQualityScore,
      provider: analysis.provider,
      model: analysis.model,
      confidenceFlags: analysis.confidenceFlags || [],
    };

    await this.cvParsedDataRepository.update(parsedDataId, payload);

    await this.cvSkillRepository.deleteByCvId(cvId);
    for (const skill of analysis.matchedSkills) {
      const matched = skill.systemSkillSlug
        ? await this.skillRepository.findBySlug(skill.systemSkillSlug)
        : await this.skillRepository.findByName(skill.normalizedName);
      if (!matched) {
        continue;
      }
      await this.cvSkillRepository.create({
        cvId,
        skillId: matched.id,
        confidenceScore: skill.confidence,
      });
    }
  }

  private async buildAnalysisRequest(
    cvId: string,
    rawText: string,
    fileExtension: 'pdf' | 'docx' | 'doc',
    fingerprint: string,
    requestedProvider?: ICvParseJob['requestedProvider'],
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
        careerCategorySlug: undefined,
        aliases: this.buildSkillAliases(skill.name, skill.slug),
      })),
    };
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
        `fingerprint:${fingerprint}`,
      ],
    };
  }

  private buildFingerprint(rawText: string): string {
    return createHash('sha256')
      .update(this.parser.summarize(rawText, 12000))
      .digest('hex');
  }

  private extractFingerprint(parsedJson?: Record<string, unknown>): string | null {
    if (!parsedJson) {
      return null;
    }
    const fingerprint = parsedJson['fingerprint'];
    return typeof fingerprint === 'string' && fingerprint
      ? fingerprint
      : null;
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeout = setTimeout(
            () =>
              reject(new Error(`CV parse job timeout after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }
}
