import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateMyCompanyProfileDto } from 'src/application/dtos/account/req.account.dto';
import type { IResponseMyCompanyDto } from 'src/application/dtos/account/res.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { resolveCompanyMedia } from 'src/common/helpers/media-url.helper';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';
import type { ICompanyEntity } from 'src/domain/entities/company.entity';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

@Injectable()
export class UpdateMyCompanyUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(UpdateMyCompanyUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestUpdateMyCompanyProfileDto,
  ): Promise<IResponseMyCompanyDto> {
    return this.runSafe('[Update My Company]:', async () => {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      if (dto.careerCategoryId !== undefined && dto.careerCategoryId !== null) {
        const careerCategory = await this.careerCategoryRepository.findById(
          dto.careerCategoryId,
        );
        if (!careerCategory) {
          throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
        }
      }

      const { phone, ...companyPayload } = dto;
      const normalizedCompanyPayload: Partial<ICompanyEntity> = {
        ...companyPayload,
      };
      if (
        dto.name !== undefined &&
        dto.name.trim() &&
        dto.name.trim() !== company.name
      ) {
        normalizedCompanyPayload.slug = await generateUniqueSlug(
          dto.name,
          'company',
          (candidate) =>
            this.companyRepository.isSlugTaken(candidate, company.id),
        );
      }

      const updatedUser =
        phone !== undefined
          ? await this.userRepository.updateProfile(userId, { phone })
          : user;

      const hasCompanyFields = Object.values(companyPayload).some(
        (value) => value !== undefined,
      );

      const finalMin = dto.employeeMin ?? company.employeeMin ?? null;
      const finalMax = dto.employeeMax ?? company.employeeMax ?? null;

      if (finalMin !== null && finalMax !== null && finalMin > finalMax) {
        throw new AppException(ERROR_CODES.INVALID_EMPLOYEE_RANGE);
      }

      const updatedCompany = hasCompanyFields
        ? await this.companyRepository.updateWithUserId(
            userId,
            normalizedCompanyPayload,
          )
        : company;

      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`, `user:detail:${userId}`],
        prefixes: ['user:list:'],
      });

      const resolvedCompany = await resolveCompanyMedia(this.storage, {
        logoUrl: updatedCompany.logoUrl,
        bannerUrl: updatedCompany.bannerUrl,
      });

      return {
        phone: updatedUser.phone,
        careerCategoryId: updatedCompany.careerCategoryId,
        name: updatedCompany.name,
        logoUrl: resolvedCompany?.logoUrl,
        bannerUrl: resolvedCompany?.bannerUrl,
        address: updatedCompany.address,
        latitude: updatedCompany.latitude,
        longitude: updatedCompany.longitude,
        taxCode: updatedCompany.taxCode,
        description: updatedCompany.description,
        websiteUrl: updatedCompany.websiteUrl,
        employeeMin: updatedCompany.employeeMin,
        employeeMax: updatedCompany.employeeMax,
      };
    });
  }
}
