import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';

const ACTIVE_APPLICATION_STATUSES = [
  EJobApplicationStatus.APPLIED,
  EJobApplicationStatus.INTERVIEW,
  EJobApplicationStatus.OFFERED,
];

@Injectable()
export class DeleteCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(DeleteCVUseCase.name));
  }

  async execute(id: string, userId: string): Promise<IResponseApiNullDto> {
    return this.runSafe(
      '[Delete CV]:',
      async () => {
        const cv = await this.cvRepository.findById(id);
        if (!cv || cv.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }

        // Ko cho xóa nếu CV đang trong quá trình ứng tuyển
        const activeApplications =
          await this.jobApplicationRepository.findActiveByCvId(id);
        const hasActive = activeApplications.some((app) =>
          ACTIVE_APPLICATION_STATUSES.includes(app.status),
        );
        if (hasActive) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_CV_IN_USE);
        }

        await this.cvRepository.softDelete(id);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);

        // Delete trên S3
        if (cv.fileUrl) {
          await this.queueDispatch.dispatchStorageDelete({
            bucketType: EBucketType.CV,
            objectKey: cv.fileUrl,
            reason: 'cv.deleted',
            aggregateId: id,
          });
        }

        return { data: null };
      },
      ERROR_CODES.CV_DELETE_FAILED,
    );
  }
}
