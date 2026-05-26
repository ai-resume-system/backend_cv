import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiFavouriteJobDto } from 'src/application/dtos/favourite-job/res.favourite-job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';

@Injectable()
export class RemoveFavouriteJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IFavouriteJobRepository')
    private readonly favouriteJobRepository: IFavouriteJobRepository,
  ) {
    super(new Logger(RemoveFavouriteJobUseCase.name));
  }

  async execute(
    userId: string,
    jobId: string,
  ): Promise<IResponseApiFavouriteJobDto> {
    return this.runSafe(
      '[Remove Favourite Job]',
      async () => {
        const favourite =
          await this.favouriteJobRepository.findByUserIdAndJobId(userId, jobId);
        if (!favourite) {
          throw new AppException(ERROR_CODES.FAVOURITE_JOB_NOT_FOUND);
        }

        await this.favouriteJobRepository.deleteByUserIdAndJobId(userId, jobId);

        return {
          data: {
            message: 'Da bo luu viec lam',
          },
        };
      },
      ERROR_CODES.FAVOURITE_JOB_DELETE_FAILED,
    );
  }
}
