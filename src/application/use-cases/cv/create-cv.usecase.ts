import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestCreateCVDto } from 'src/application/dtos/cv/req.cv.dto';
import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class CreateCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
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
        const cv = await this.cvRepository.create({
          userId,
          title: dto.title ? this.removeExtension(dto.title) : undefined,
          fileUrl: dto.fileUrl,
          fileExtension: dto.fileExtension,
        });
        const parsedData = await this.cvParsedDataRepository.findLatestByCvId(
          cv.id,
        );
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        return {
          data: {
            ...cv,
            processingStatus:
              parsedData?.processingStatus || EProcessingStatus.PENDING,
            summary: parsedData?.summary,
          },
        };
      },
      ERROR_CODES.CV_CREATE_FAILED,
    );
  }

  private removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').trim();
  }
}
