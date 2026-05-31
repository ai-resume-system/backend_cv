import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IRequestUploadFileDto } from 'src/application/dtos/upload/req.upload.dto';
import { IResponseApiUploadDto } from 'src/application/dtos/upload/res.upload.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import {
  EBucketType,
  EUploadType,
} from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { FileValidationService } from 'src/infrastructure/storage/file-validation.service';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

const UPLOAD_RATE_LIMIT_WINDOW_SECONDS = 60;
const UPLOAD_RATE_LIMIT_MAX = 5;

@Injectable()
export class UploadFileUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly fileValidation: FileValidationService,
    private readonly storage: S3StorageService,
    private readonly redis: RedisAdapter,
    private readonly configService: ConfigService,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(UploadFileUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestUploadFileDto,
  ): Promise<IResponseApiUploadDto> {
    return this.runSafe(
      '[Upload File]:',
      async () => {
        await this.checkUploadRateLimit(userId, dto.type);

        if (dto.type === EUploadType.CV) {
          return this.uploadCv(userId, dto.file);
        }

        return this.uploadImage(userId, dto.type, dto.file);
      },
      ERROR_CODES.MEDIA_UPLOAD_FAILED,
    );
  }

  private async uploadCv(
    userId: string,
    file: Express.Multer.File,
  ): Promise<IResponseApiUploadDto> {
    const validated = await this.fileValidation.validateCvFile(file);
    const objectKey = `${userId}/${randomUUID()}.${validated.extension}`;

    await this.storage.uploadObject({
      key: objectKey,
      buffer: file.buffer,
      contentType: validated.mime,
      bucketType: EBucketType.CV,
    });

    const cv = await this.cvRepository.create({
      userId,
      title: this.removeExtension(file.originalname),
      fileUrl: objectKey,
      fileExtension: validated.extension,
    });

    await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
    return {
      data: {
        ...cv,
        processingStatus: EProcessingStatus.PENDING,
        summary: undefined,
      },
    };
  }

  private async uploadImage(
    userId: string,
    type: EUploadType,
    file: Express.Multer.File,
  ): Promise<IResponseApiUploadDto> {
    const bucketType = this.resolveBucketType(type);
    const validated = await this.fileValidation.validateImageFile(file);
    const objectKey = `${userId}/${randomUUID()}.${validated.extension}`;

    await this.storage.uploadObject({
      key: objectKey,
      buffer: file.buffer,
      contentType: validated.mime,
      bucketType,
    });
    await this.persistImageUrl(userId, type, objectKey);

    const expiresIn = this.configService.get<number>(
      'S3_PRESIGNED_TTL_SECONDS',
      900,
    );
    const previewUrl = await this.storage.createPrivatePreviewUrl(
      objectKey,
      bucketType,
      expiresIn,
    );

    return {
      data: {
        type,
        bucketType,
        objectKey,
        previewUrl,
        expiresIn,
        originalName: file.originalname,
        fileExtension: validated.extension,
        mimeType: validated.mime,
        size: file.size,
      },
    };
  }

  private async persistImageUrl(
    userId: string,
    type: EUploadType,
    objectKey: string,
  ): Promise<void> {
    if (type === EUploadType.AVATAR) {
      await this.profileRepository.updateWithUserId(userId, {
        avatarUrl: objectKey,
      });
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`],
        prefixes: [],
      });
      return;
    }

    if (type === EUploadType.LOGO) {
      await this.companyRepository.updateWithUserId(userId, {
        logoUrl: objectKey,
      });
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`],
        prefixes: [],
      });
      return;
    }

    if (type === EUploadType.BANNER) {
      await this.companyRepository.updateWithUserId(userId, {
        bannerUrl: objectKey,
      });
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`],
        prefixes: [],
      });
    }
  }

  private resolveBucketType(type: EUploadType): EBucketType {
    switch (type) {
      case EUploadType.AVATAR:
        return EBucketType.AVATAR;
      case EUploadType.LOGO:
        return EBucketType.COMPANY_LOGO;
      case EUploadType.BANNER:
        return EBucketType.BANNER;
      default:
        throw new AppException(ERROR_CODES.MEDIA_TYPE_INVALID);
    }
  }

  private async checkUploadRateLimit(
    userId: string,
    type: EUploadType,
  ): Promise<void> {
    const key = `rate:upload:${type}:${userId}`;
    try {
      const count = await this.redis.incrWithExpiry(
        key,
        UPLOAD_RATE_LIMIT_WINDOW_SECONDS,
      );
      if (count > UPLOAD_RATE_LIMIT_MAX) {
        throw new AppException(ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.warn(
        `Redis upload rate-limit unavailable for ${userId}: ${error.message}`,
      );
    }
  }

  private removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').trim();
  }
}
