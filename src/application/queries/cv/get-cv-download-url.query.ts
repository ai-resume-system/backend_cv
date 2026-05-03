import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IResponseApiCVDownloadDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import {
  EBucketType,
  S3StorageService,
} from 'src/infrastructure/storage/s3-storage.service';

@Injectable()
export class GetCVDownloadUrlQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
    private readonly configService: ConfigService,
  ) {
    super(new Logger(GetCVDownloadUrlQuery.name));
  }

  async execute(
    id: string,
    userId: string,
  ): Promise<IResponseApiCVDownloadDto> {
    return this.runSafe('[Get CV Download Url]: ', async () => {
      const cv = await this.cvRepository.findById(id);
      if (!cv || cv.userId !== userId || !cv.fileUrl) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }
      const cacheKey = `cv:download:${cv.id}:${cv.updatedAt.getTime()}`;
      const cached = await this.redis.safeGet(cacheKey);
      const downloadTtlSeconds = this.configService.get<number>(
        'S3_PRESIGNED_TTL_SECONDS',
        900,
      );
      if (cached) {
        return {
          data: { downloadUrl: cached, expiresIn: downloadTtlSeconds },
        };
      }
      const downloadUrl = await this.storage.createPrivateDownloadUrl(
        cv.fileUrl,
        EBucketType.CV,
        downloadTtlSeconds,
        this.buildDownloadFileName(cv.title, cv.fileExtension, cv.fileUrl),
      );
      await this.redis.safeSet(cacheKey, downloadUrl, downloadTtlSeconds - 60);
      return { data: { downloadUrl, expiresIn: downloadTtlSeconds } };
    });
  }

  private buildDownloadFileName(
    title?: string,
    fileExtension?: string,
    fileUrl?: string,
  ): string | undefined {
    const extension =
      fileExtension || fileUrl?.split('?')[0]?.split('.').pop() || undefined;
    if (!title && !extension) return undefined;
    if (!title) return fileUrl?.split('/').pop();
    const normalizedTitle = title.replace(/\.[^/.]+$/, '').trim();
    return extension ? `${normalizedTitle}.${extension}` : normalizedTitle;
  }
}
