import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateCVDto } from 'src/application/dtos/cv/req.cv.dto';
import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class UpdateCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
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
          ...(dto.status ? { status: dto.status } : {}),
        };

        if (!Object.keys(updateData).length) {
          return { data: existing };
        }

        const cv = await this.cvRepository.update(id, updateData);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
        return { data: cv };
      },
      ERROR_CODES.CV_UPDATE_FAILED,
    );
  }

  private removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').trim();
  }
}
