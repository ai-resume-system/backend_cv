import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class DeleteCompanyLogoUseCase extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(DeleteCompanyLogoUseCase.name));
  }

  async execute(
    userId: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return this.runSafe('[Delete Company Logo]:', async () => {
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const currentLogoUrl = company.logoUrl;

      await this.companyRepository.updateWithUserId(userId, {
        logoUrl: null,
      });

      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`],
        prefixes: [],
      });

      if (currentLogoUrl && !/^https?:\/\//i.test(currentLogoUrl)) {
        await this.queueDispatch.dispatchStorageDelete({
          bucketType: EBucketType.COMPANY_LOGO,
          objectKey: currentLogoUrl,
          reason: 'company.logo.deleted',
          aggregateId: userId,
        });
      }

      return {
        data: {
          success: true,
          message: 'Company logo deleted successfully',
        },
      };
    });
  }
}
