import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiCVAnalyzeActionDto } from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class AnalyzeCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(AnalyzeCVUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
  ): Promise<IResponseApiCVAnalyzeActionDto> {
    return this.runSafe(
      '[Analyze CV]:',
      async () => {
        const cv = await this.cvRepository.findById(id);
        if (!cv || cv.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }

        if (!cv.fileUrl || !cv.fileExtension) {
          throw new AppException(ERROR_CODES.CV_ANALYSIS_FILE_MISSING_ERROR);
        }

        // Cooldown tránh spam phân tích CV liên tiếp.
        // const cooldownKey = `cooldown:cv-analyze:${userId}`;
        // const isCoolingDown = await this.redis.safeGet(cooldownKey);
        // if (isCoolingDown) {
        //   throw new AppException(ERROR_CODES.CV_ANALYSIS_COOLDOWN_ERROR);
        // }

        const latestParsedData =
          await this.cvParsedDataRepository.findLatestByCvId(id);
        if (
          latestParsedData &&
          latestParsedData.processingStatus === EProcessingStatus.PROCESSING
        ) {
          return {
            data: {
              cvId: id,
              processingStatus: EProcessingStatus.PROCESSING,
              message: 'CV đang được phân tích.',
              reusedExistingResult: true,
            },
          };
        }

        const lockKey = `lock:cv-analyze:${id}`;
        const lockAcquired = await this.redis.safeSetNx(
          lockKey,
          new Date().toISOString(),
          60,
        );
        if (!lockAcquired) {
          return {
            data: {
              cvId: id,
              processingStatus: EProcessingStatus.PROCESSING,
              message: 'CV đang được phân tích.',
              reusedExistingResult: true,
            },
          };
        }

        try {
          const parsedData = await this.cvParsedDataRepository.create({
            cvId: id,
            processingStatus: EProcessingStatus.PROCESSING,
          });

          await this.queueDispatch.dispatchCvParse({
            cvId: id,
            parsedDataId: parsedData.id,
            fileKey: cv.fileUrl,
            extension: cv.fileExtension as 'pdf' | 'docx' | 'doc',
          });
        } catch (error) {
          await this.redis.safeDel(lockKey);
          throw error;
        }

        // // Tránh spam phân tích CV liên tiếp.
        // await this.redis.safeSet(
        //   cooldownKey,
        //   new Date().toISOString(),
        //   TTL_10M,
        // );

        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);

        return {
          data: {
            cvId: id,
            processingStatus: EProcessingStatus.PROCESSING,
            message: 'CV analysis job has been queued successfully',
            reusedExistingResult: false,
          },
        };
      },
      ERROR_CODES.CV_ANALYSIS_TRIGGER_FAILED_ERROR,
    );
  }
}
