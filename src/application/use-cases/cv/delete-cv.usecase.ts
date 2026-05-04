import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { EBucketType } from 'src/infrastructure/storage/s3-storage.service';

@Injectable()
export class DeleteCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(DeleteCVUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return this.runSafe(
      'Delete CV',
      async () => {
        const cv = await this.cvRepository.findById(id);
        if (!cv || cv.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }
        await this.cvRepository.delete(id);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        if (cv.fileUrl) {
          await this.queueDispatch.dispatchStorageDelete({
            bucketType: EBucketType.CV,
            objectKey: cv.fileUrl,
            reason: 'cv.deleted',
            aggregateId: id,
          });
        }
        return {
          data: {
            success: true,
            message: 'CV deleted successfully',
          },
        };
      },
      ERROR_CODES.CV_DELETE_FAILED,
    );
  }
}
