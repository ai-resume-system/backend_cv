import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IResponseApiCVPreviewDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { EBucketType } from 'src/common/constants/enum/upload.enum';

@Injectable()
export class GetCVPreviewUrlQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
    private readonly configService: ConfigService,
  ) {
    super(new Logger(GetCVPreviewUrlQuery.name));
  }

  async execute(id: string, userId: string): Promise<IResponseApiCVPreviewDto> {
    return this.runSafe('[Get CV Preview Url]: ', async () => {
      const cv = await this.cvRepository.findById(id);
      if (!cv || cv.userId !== userId || !cv.fileUrl) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const previewTtlSeconds = this.configService.get<number>(
        'MINIO_PRESIGNED_URL_TTL',
        900,
      );
      const cacheKey = `cv:preview:${cv.id}:${cv.updatedAt.getTime()}`;
      const cached = await this.redis.safeGet(cacheKey);
      if (cached) {
        return {
          data: { previewUrl: cached, expiresIn: previewTtlSeconds },
        };
      }

      const previewUrl = await this.storage.createPrivatePreviewUrl(
        cv.fileUrl,
        EBucketType.CV,
        previewTtlSeconds,
      );
      await this.redis.safeSet(cacheKey, previewUrl, previewTtlSeconds - 60);
      return { data: { previewUrl, expiresIn: previewTtlSeconds } };
    });
  }
}
