import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { IRequestUpdateMyCompanyDto } from 'src/application/dtos/account/req.account.dto';
import type { IResponseMyCompanyDto } from 'src/application/dtos/account/res.account.dto';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import {
  EBucketType,
  S3StorageService,
} from 'src/infrastructure/storage/s3-storage.service';

const ACCOUNT_IMAGE_PREVIEW_TTL_SECONDS = 900;

@Injectable()
export class UpdateMyCompanyUseCase extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(UpdateMyCompanyUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestUpdateMyCompanyDto,
  ): Promise<IResponseMyCompanyDto> {
    return this.runSafe('[Update My Company]:', async () => {
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const updated = await this.companyRepository.updateWithUserId(
        userId,
        dto,
      );
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`, `user:detail:${userId}`],
        prefixes: ['user:list:'],
      });
      return {
        id: updated.id,
        careerCategoriesId: updated.careerCategoriesId,
        companyName: updated.companyName,
        taxCode: updated.taxCode,
        logoUrl: await this.toPreviewUrl(
          updated.logoUrl,
          EBucketType.COMPANY_LOGO,
        ),
        bannerUrl: await this.toPreviewUrl(updated.bannerUrl, EBucketType.BANNER),
        location: updated.location,
        description: updated.description,
        websiteUrl: updated.websiteUrl,
      };
    });
  }

  private async toPreviewUrl(
    value: string | undefined,
    bucketType: EBucketType,
  ): Promise<string | undefined> {
    if (!value || this.storage.isExternalUrl(value)) {
      return value;
    }
    return this.storage.createPrivatePreviewUrl(
      value,
      bucketType,
      ACCOUNT_IMAGE_PREVIEW_TTL_SECONDS,
    );
  }
}
