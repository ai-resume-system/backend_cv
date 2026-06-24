import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IJobMatchResultDto,
  IResponseApiJobMatchOrEmptyDto,
} from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobMatchRepository } from 'src/domain/repositories/job-match.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';

interface ISavedJobMatchDetails {
  jobSlug?: string;
  breakdown?: IJobMatchResultDto['breakdown'];
  matchedSkills?: IJobMatchResultDto['matchedSkills'];
  missingSkills?: IJobMatchResultDto['missingSkills'];
  strengths?: string[];
  risks?: string[];
  improvementSuggestions?: string[];
  computedAt?: string | Date;
}

@Injectable()
export class GetJobMatchQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobMatchRepository')
    private readonly jobMatchRepository: IJobMatchRepository,
  ) {
    super(new Logger(GetJobMatchQuery.name));
  }

  async execute(
    slug: string,
    cvId: string,
    userId: string,
  ): Promise<IResponseApiJobMatchOrEmptyDto> {
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

      const savedMatch = await this.jobMatchRepository.findByCvIdAndJobId(
        cv.id,
        job.id,
      );
      if (!savedMatch) {
        return { data: [] };
      }

      const savedResponse = this.toResponseFromSavedMatch(savedMatch, job.slug);
      if (!savedResponse) {
        return { data: [] };
      }

      return savedResponse;
    });
  }

  private toResponseFromSavedMatch(
    savedMatch: {
      cvId: string;
      jobId: string;
      matchScore: number;
      matchedSkills?: Record<string, unknown>;
      updatedAt: Date;
    },
    currentJobSlug: string,
  ): IResponseApiJobMatchOrEmptyDto | null {
    const details = savedMatch.matchedSkills as ISavedJobMatchDetails | undefined;
    if (!details?.breakdown) {
      return null;
    }

    return {
      data: {
        cvId: savedMatch.cvId,
        jobId: savedMatch.jobId,
        jobSlug: details.jobSlug || currentJobSlug,
        matchScore: savedMatch.matchScore,
        breakdown: details.breakdown,
        matchedSkills: details.matchedSkills || [],
        missingSkills: details.missingSkills || [],
        strengths: details.strengths || [],
        risks: details.risks || [],
        improvementSuggestions: details.improvementSuggestions || [],
        computedAt: details.computedAt
          ? new Date(details.computedAt)
          : savedMatch.updatedAt,
      },
    };
  }
}
