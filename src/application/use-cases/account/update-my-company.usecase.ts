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
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

const ACCOUNT_IMAGE_PREVIEW_TTL_SECONDS = 900;

@Injectable()
export class UpdateMyCompanyUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
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
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const { phone, ...companyPayload } = dto;

      const updatedUser =
        phone !== undefined
          ? await this.userRepository.updateProfile(userId, { phone })
          : user;

      const hasCompanyFields = Object.values(companyPayload).some(
        (value) => value !== undefined,
      );

      const updatedCompany = hasCompanyFields
        ? await this.companyRepository.updateWithUserId(userId, companyPayload)
        : company;

      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`, `user:detail:${userId}`],
        prefixes: ['user:list:'],
      });

      return {
        phone: updatedUser.phone,
        careerCategoriesId: updatedCompany.careerCategoriesId,
        companyName: updatedCompany.companyName,
        taxCode: updatedCompany.taxCode,
        logoUrl: await this.toPreviewUrl(
          updatedCompany.logoUrl,
          EBucketType.COMPANY_LOGO,
        ),
        bannerUrl: await this.toPreviewUrl(
          updatedCompany.bannerUrl,
          EBucketType.BANNER,
        ),
        location: updatedCompany.location,
        description: updatedCompany.description,
        websiteUrl: updatedCompany.websiteUrl,
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
