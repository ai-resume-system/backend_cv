import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IMyProfileResponseDto } from 'src/application/dtos/account/res.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

@Injectable()
export class GetMyProfileQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {
    super(new Logger(GetMyProfileQuery.name));
  }

  async execute(userId: string): Promise<IMyProfileResponseDto> {
    return this.runSafe('[Get Profile]:', async () => {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND);
      }

      const baseData = {
        id: user.id,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
      };

      const timeData = {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      };

      let result = {};

      switch (user.role) {
        case EUserRole.JOB_SEEKER:
          const profile = await this.profileRepository.findByUserId(userId);
          result = {
            profile: profile
              ? {
                  fullName: profile.fullName,
                  avatarUrl: profile.avatarUrl,
                  bio: profile.bio,
                }
              : undefined,
          };
          break;
        case EUserRole.RECRUITER:
          const company = await this.companyRepository.findByUserId(userId);
          result = {
            company: company
              ? {
                  careerCategoriesId: company.careerCategoriesId,
                  companyName: company.companyName,
                  logoUrl: company.logoUrl,
                  location: company.location,
                  description: company.description,
                  taxCode: company.taxCode,
                  websiteUrl: company.websiteUrl,
                }
              : undefined,
          };
          break;
        case EUserRole.ADMIN:
          result = {};
          break;
      }
      return {
        ...baseData,
        ...result,
        ...timeData,
      } as IMyProfileResponseDto;
    });
  }
}
