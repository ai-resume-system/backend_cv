import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import {
  IUpdateCompanyDto,
  IUpdateProfileDto,
} from 'src/application/dtos/user/req.user.dto';

@Injectable()
export class UpdateProfileUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {
    super(new Logger(UpdateProfileUseCase.name));
  }

  async updateUserProfile(
    userId: string,
    dto: IUpdateProfileDto,
    role: EUserRole,
  ) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.profileRepository.update(userId, dto);
  }

  async updateCompanyProfile(userId: string, dto: IUpdateCompanyDto) {
    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.companyRepository.update(userId, dto);
  }
}
