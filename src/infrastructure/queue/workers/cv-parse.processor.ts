import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { AiCvAnalysisClient } from 'src/infrastructure/ai/ai-cv-analysis.client';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { CvParserService } from 'src/infrastructure/storage/cv-parser.service';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { CV_PARSE_DLQ, CV_PARSE_QUEUE, ICvParseJob } from '../queue.constants';

@Processor(CV_PARSE_QUEUE)
export class CvParseProcessor extends WorkerHost {
  private readonly logger = new Logger(CvParseProcessor.name);

  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
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
      await this.cvRepository.update(job.data.cvId, {
        processingStatus: EProcessingStatus.PROCESSING,
      });
      const buffer = await this.withTimeout(
        this.storage.getPrivateObjectBuffer(job.data.fileKey),
        60000,
      );
      const rawText = await this.withTimeout(
        this.parser.parse(buffer, job.data.extension),
        60000,
      );
      const analysis = await this.withTimeout(
        this.aiClient.analyze({
          cvId: job.data.cvId,
          rawText,
          fileExtension: job.data.extension,
        }),
        90000,
      );
      await this.persistAnalysis(job.data.cvId, rawText, analysis);
      await this.cvRepository.update(job.data.cvId, {
        summary: analysis.summary || this.parser.summarize(rawText),
        processingStatus: EProcessingStatus.COMPLETED,
      });
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);
    } catch (error) {
      this.logger.error(`CV parse failed: ${error.message}`, error.stack);
      await this.cvRepository.update(job.data.cvId, {
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
    rawText: string,
    analysis: Awaited<ReturnType<AiCvAnalysisClient['analyze']>>,
  ): Promise<void> {
    const existing = await this.cvParsedDataRepository.findByCvId(cvId);
    const payload = {
      rawText,
      parsedJson: {
        summary: analysis.summary,
        score: analysis.score,
        skills: analysis.skills,
        education: analysis.education,
        experience: analysis.experience,
        suggestions: analysis.suggestions,
        provider: analysis.provider,
        model: analysis.model,
        confidenceFlags: analysis.confidenceFlags || [],
      },
      score: analysis.score,
    };

    if (existing) {
      await this.cvParsedDataRepository.update(existing.id, payload);
    } else {
      await this.cvParsedDataRepository.create({
        cvId,
        ...payload,
      });
    }

    await this.cvSkillRepository.deleteByCvId(cvId);
    for (const skill of analysis.skills) {
      const matched = await this.skillRepository.findByName(
        skill.normalizedName,
      );
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
