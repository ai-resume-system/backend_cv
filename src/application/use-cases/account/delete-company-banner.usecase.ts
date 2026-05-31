import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';

@Injectable()
export class DeleteCompanyBannerUseCase extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(DeleteCompanyBannerUseCase.name));
  }

  async execute(userId: string): Promise<IResponseApiNullDto> {
    return this.runSafe('[Delete Company Banner]:', async () => {
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const currentBannerUrl = company.bannerUrl;

      await this.companyRepository.updateWithUserId(userId, {
        bannerUrl: null,
      });

      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`],
        prefixes: [],
      });

      if (currentBannerUrl && !/^https?:\/\//i.test(currentBannerUrl)) {
        await this.queueDispatch.dispatchStorageDelete({
          bucketType: EBucketType.BANNER,
          objectKey: currentBannerUrl,
          reason: 'company.banner.deleted',
          aggregateId: userId,
        });
      }

      return { data: null };
    });
  }
}
