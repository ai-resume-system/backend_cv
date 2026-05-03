import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateCVDto } from 'src/application/dtos/cv/req.cv.dto';
import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { FileValidationService } from 'src/infrastructure/storage/file-validation.service';
import {
  EBucketType,
  S3StorageService,
} from 'src/infrastructure/storage/s3-storage.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UpdateCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly fileValidation: FileValidationService,
    private readonly storage: S3StorageService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateCVUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
    dto: IRequestUpdateCVDto,
  ): Promise<IResponseApiCVDto> {
    return this.runSafe('[Update CV]: ', async () => {
      const existing = await this.cvRepository.findById(id);
      if (!existing || existing.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      let fileUrl: string | undefined;
      let fileExtension: 'pdf' | 'docx' | 'doc' | undefined;
      if (dto.file) {
        await this.checkUploadRateLimit(userId);
        const validated = await this.fileValidation.validateCvFile(dto.file);
        fileExtension = validated.extension;
        fileUrl = `${userId}/${randomUUID()}.${validated.extension}`;
        await this.storage.uploadObject({
          key: fileUrl,
          buffer: dto.file.buffer,
          contentType: validated.mime,
        });
      }

      const updateData = {
        ...(dto.title ? { title: this.removeExtension(dto.title) } : {}),
        ...(!dto.title && !existing.title && fileUrl && dto.file?.originalname
          ? { title: this.removeExtension(dto.file.originalname) }
          : {}),
        ...(fileUrl
          ? {
              fileUrl,
              fileExtension,
              processingStatus: EProcessingStatus.PENDING,
            }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
      };
      if (!Object.keys(updateData).length) {
        return { data: existing };
      }
      const cv = await this.cvRepository.update(id, updateData);

      if (fileUrl && existing.fileUrl && existing.fileUrl !== fileUrl) {
        await this.queueDispatch.dispatchStorageDelete({
          bucketType: EBucketType.CV,
          objectKey: existing.fileUrl,
          reason: 'cv.replaced',
          aggregateId: cv.id,
        });
      }

      await this.queueDispatch.dispatchSearchIndex({
        aggregateType: 'cv',
        aggregateId: cv.id,
        action: 'index',
      });
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`cv:detail:${cv.id}`],
        prefixes: [`cv:list:user:${cv.userId}:`],
      });
      return { data: cv };
    });
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
