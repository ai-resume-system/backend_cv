import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IResponseApiTempCVUploadDto } from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { FileValidationService } from 'src/infrastructure/storage/file-validation.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

const TEMP_CV_ANALYSIS_PREFIX = 'temp/ai-cv';
const TEMP_CV_ANALYSIS_TTL_SECONDS = 2 * 60 * 60;

@Injectable()
export class UploadTempCVAnalysisUseCase extends BaseUsecase {
  constructor(
    private readonly fileValidation: FileValidationService,
    private readonly storage: S3StorageService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UploadTempCVAnalysisUseCase.name));
  }

  async execute(
    userId: string,
    file: Express.Multer.File,
  ): Promise<IResponseApiTempCVUploadDto> {
    return this.runSafe(
      '[Upload Temp CV Analysis]:',
      async () => {
        const validated = await this.fileValidation.validateCvFile(file);
        const tempFileKey = randomUUID();
        const objectKey = `${TEMP_CV_ANALYSIS_PREFIX}/${userId}/${tempFileKey}.${validated.extension}`;

        await this.storage.uploadObject({
          key: objectKey,
          buffer: file.buffer,
          contentType: validated.mime,
          bucketType: EBucketType.CV,
        });

        await this.redis.safeSetJson(
          this.buildTempFileKey(tempFileKey),
          {
            userId,
            objectKey,
            fileName: file.originalname,
            fileExtension: validated.extension,
            uploadedAt: new Date().toISOString(),
          },
          TEMP_CV_ANALYSIS_TTL_SECONDS,
        );

        return {
          data: {
            tempFileKey,
            fileName: file.originalname,
            fileExtension: validated.extension,
            expiresInSeconds: TEMP_CV_ANALYSIS_TTL_SECONDS,
          },
        };
      },
      ERROR_CODES.MEDIA_UPLOAD_FAILED,
    );
  }

  private buildTempFileKey(tempFileKey: string): string {
    return `cv:analysis:temp:file:${tempFileKey}`;
  }
}
