import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestCreateCVDto } from 'src/application/dtos/cv/req.cv.dto';
import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { FileValidationService } from 'src/infrastructure/storage/file-validation.service';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly fileValidation: FileValidationService,
    private readonly storage: S3StorageService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(CreateCVUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestCreateCVDto,
  ): Promise<IResponseApiCVDto> {
    return this.runSafe(
      '[Create CV]:',
      async () => {
        await this.checkUploadRateLimit(userId);
        const validated = await this.fileValidation.validateCvFile(dto.file);
        const key = `${userId}/${randomUUID()}.${validated.extension}`;
        await this.storage.uploadObject({
          key,
          buffer: dto.file.buffer,
          contentType: validated.mime,
        });
        const cv = await this.cvRepository.create({
          userId: userId,
          title: this.removeExtension(dto.title || dto.file.originalname),
          fileUrl: key,
          fileExtension: validated.extension,
          isDefault: false,
          processingStatus: EProcessingStatus.PENDING,
        });
        await this.queueDispatch.dispatchCacheInvalidation({
          prefixes: [`cv:list:user:${cv.userId}:`],
        });
        return { data: cv };
      },
      ERROR_CODES.CV_CREATE_FAILED,
    );
  }

  private async checkUploadRateLimit(userId: string): Promise<void> {
    const WINDOW_SECONDS = 60; // 1 phút
    const MAX_UPLOADS = 5; // 5 lần / phút

    const key = `rate:cv:upload:${userId}`;
    try {
      const count = await this.redis.incrWithExpiry(key, WINDOW_SECONDS);
      if (count > MAX_UPLOADS) {
        throw new AppException(ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.error(
        `Redis CV upload rate-limit unavailable for${userId}: ${error.message}`,
      );
      throw new AppException(ERROR_CODES.SYSTEM_BUSY);
    }
  }

  private removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').trim();
  }
}
