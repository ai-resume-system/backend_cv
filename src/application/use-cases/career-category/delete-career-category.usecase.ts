import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class DeleteCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(DeleteCareerCategoryUseCase.name));
  }

  async execute(id: string): Promise<{ message: string }> {
    return this.runSafe('[Delete Career Category]:', async () => {
      const existing = await this.careerCategoryRepository.findById(id);
      if (!existing) {
        throw new AppException(
          ERROR_CODES.CAREER_CATEGORY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.careerCategoryRepository.delete(id);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_LIST);
      return { message: 'Xóa ngành nghề thành công.' };
    });
  }
}
