import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateCVDto } from 'src/application/dtos/cv/req.cv.dto';
import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class UpdateCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateCVUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
    dto: IRequestUpdateCVDto,
  ): Promise<IResponseApiCVDto> {
    return this.runSafe(
      '[Update CV]: ',
      async () => {
        const existing = await this.cvRepository.findById(id);
        if (!existing || existing.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }

        const updateData = {
          ...(dto.title ? { title: this.removeExtension(dto.title) } : {}),
        };

        if (!Object.keys(updateData).length) {
          const existingParsedData =
            await this.cvParsedDataRepository.findLatestByCvId(existing.id);
          return {
            data: {
              ...existing,
              processingStatus:
                existingParsedData?.processingStatus ||
                EProcessingStatus.PENDING,
              summary: existingParsedData?.summary,
            },
          };
        }

        const cv = await this.cvRepository.update(id, updateData);
        const parsedData = await this.cvParsedDataRepository.findLatestByCvId(
          cv.id,
        );
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);
        return {
          data: {
            ...cv,
            processingStatus:
              parsedData?.processingStatus || EProcessingStatus.PENDING,
            summary: parsedData?.summary,
          },
        };
      },
      ERROR_CODES.CV_UPDATE_FAILED,
    );
  }

  private removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').trim();
  }
}
