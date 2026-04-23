import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { IRequestUpdateMyCompanyDto } from 'src/application/dtos/account/req.account.dto';
import type { IResponseMyCompanyDto } from 'src/application/dtos/account/res.account.dto';

@Injectable()
export class UpdateMyCompanyUseCase extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
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
      return {
        id: updated.id,
        careerCategoriesId: updated.careerCategoriesId,
        companyName: updated.companyName,
        taxCode: updated.taxCode,
        logoUrl: updated.logoUrl,
        location: updated.location,
        description: updated.description,
        websiteUrl: updated.websiteUrl,
      };
    });
  }
}
