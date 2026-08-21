import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  IResponseApiCVDto,
  ICVResponseDto,
} from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetCVByIdQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetCVByIdQuery.name));
  }

  async execute(id: string, userId: string): Promise<IResponseApiCVDto> {
    return this.runSafe('[Get CV By Id]:', async () => {
      const cv = await this.cvRepository.findById(id);
      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const parsedData = await this.cvParsedDataRepository.findLatestByCvId(cv.id);
      const snapshotUpdatedAt = parsedData?.updatedAt || cv.updatedAt;
      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.CV_DETAIL);
      const cacheKey = `${CACHE_KEYS.CV_DETAIL}:v${version}:${cv.id}:${snapshotUpdatedAt.getTime()}`;
      const cached = await this.redis.safeGetJson<IResponseApiCVDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const data: ICVResponseDto = {
        ...cv,
        processingStatus:
          parsedData?.processingStatus || EProcessingStatus.PENDING,
        summary: parsedData?.summary,
      };
      const response: IResponseApiCVDto = { data };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
