import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestCreateJobApplicationDto } from 'src/application/dtos/job-application/req.job-application.dto';
import { IJobApplicationResponseDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { ECVStatus } from 'src/common/constants/enum/cv.enum';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobMatchRepository } from 'src/domain/repositories/job-match.repository.interface';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

@Injectable()
export class CreateJobApplicationUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    // @Inject('IJobMatchRepository')
    // private readonly jobMatchRepository: IJobMatchRepository,
  ) {
    super(new Logger(CreateJobApplicationUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestCreateJobApplicationDto,
  ): Promise<{ data: IJobApplicationResponseDto }> {
    return this.runSafe(
      '[Create Job Application]',
      async () => {
        const cv = await this.cvRepository.findById(dto.cvId);
        if (!cv) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }
        if (cv.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_ACCESS_DENIED);
        }

        // Kiểm tra job có tồn tại và còn hạn không
        const job = await this.jobRepository.findById(dto.jobId);
        if (!job) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        if (job.status !== EJobStatus.OPEN) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_JOB_NOT_OPEN);
        }
        if (job.expiredAt && job.expiredAt < new Date()) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_JOB_EXPIRED);
        }

        const existingJobApplication =
          await this.jobApplicationRepository.findByJobIdAndUserId(
            dto.jobId,
            userId,
          );
        // Kiểm tra chưa ứng tuyển (trùng lặp)
        if (existingJobApplication) {
          const activeStatuses = [
            EJobApplicationStatus.APPLIED,
            EJobApplicationStatus.REVIEWING,
            EJobApplicationStatus.INTERVIEW,
            EJobApplicationStatus.OFFERED,
            EJobApplicationStatus.ACCEPTED,
          ];
          if (activeStatuses.includes(existingJobApplication.status)) {
            throw new AppException(ERROR_CODES.JOB_APPLICATION_ALREADY_EXISTS);
          }
        }

        let matchingScore: number | undefined;
        // const jobMatch = await this.jobMatchRepository.findByCvIdAndJobId(
        //   dto.cvId,
        //   dto.jobId,
        // );
        // if (jobMatch) {
        //   matchingScore = jobMatch.matchScore;
        // }

        const application = await this.jobApplicationRepository.create({
          cvId: dto.cvId,
          userId: userId,
          jobId: dto.jobId,
          matchingScore: matchingScore,
        });

        await this.cvRepository.update(dto.cvId, { status: ECVStatus.IN_USE });

        return { data: application };
      },
      ERROR_CODES.JOB_APPLICATION_CREATE_FAILED,
    );
  }
}
