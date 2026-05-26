import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestCreateFavouriteJobDto } from 'src/application/dtos/favourite-job/req.favourite-job.dto';
import { IResponseApiFavouriteJobDto } from 'src/application/dtos/favourite-job/res.favourite-job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';

@Injectable()
export class AddFavouriteJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IFavouriteJobRepository')
    private readonly favouriteJobRepository: IFavouriteJobRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {
    super(new Logger(AddFavouriteJobUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestCreateFavouriteJobDto,
  ): Promise<IResponseApiFavouriteJobDto> {
    return this.runSafe(
      '[Add Favourite Job]',
      async () => {
        const job = await this.jobRepository.findById(dto.jobId);
        if (!job) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        const exists = await this.favouriteJobRepository.existsByUserIdAndJobId(
          userId,
          dto.jobId,
        );
        if (exists) {
          throw new AppException(ERROR_CODES.FAVOURITE_JOB_ALREADY_EXISTS);
        }

        await this.favouriteJobRepository.create({
          userId,
          jobId: dto.jobId,
        });

        return {
          data: {
            message: 'Da luu viec lam yeu thich',
          },
        };
      },
      ERROR_CODES.FAVOURITE_JOB_CREATE_FAILED,
    );
  }
}
