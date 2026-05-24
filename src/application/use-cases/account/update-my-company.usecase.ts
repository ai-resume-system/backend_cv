import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateMyCompanyDto } from 'src/application/dtos/account/req.account.dto';
import type { IResponseMyCompanyDto } from 'src/application/dtos/account/res.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class UpdateMyCompanyUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
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
        location: updatedCompany.location,
        description: updatedCompany.description,
        websiteUrl: updatedCompany.websiteUrl,
      };
    });
  }
}
