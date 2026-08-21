import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IRequestUpdateDefaultCVDto } from 'src/application/dtos/cv/req.cv.dto';
import type { ICVResponseDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class SetDefaultCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(SetDefaultCVUseCase.name));
  }

  async execute(
    cvId: string,
    userId: string,
    dto: IRequestUpdateDefaultCVDto,
  ): Promise<{ data: ICVResponseDto }> {
    return this.runSafe('[Set Default CV]:', async () => {
      const cv = await this.cvRepository.findById(cvId);
      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const updated = dto.isDefault
        ? await this.cvRepository.setDefault(cvId, userId)
        : await this.cvRepository.unsetDefault(cvId, userId);

      const parsedData = await this.cvParsedDataRepository.findLatestByCvId(
        updated.id,
      );

      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);

      return {
        data: {
          ...updated,
          processingStatus:
            parsedData?.processingStatus || EProcessingStatus.PENDING,
          summary: parsedData?.summary,
        },
      };
    });
  }
}
