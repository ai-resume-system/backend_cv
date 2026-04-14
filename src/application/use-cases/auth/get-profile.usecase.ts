import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';

@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(userId: string): Promise<any> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user) {
      throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND.message);
    }

    const baseData = {
      id: user.id,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.role === EUserRole.JOB_SEEKER) {
      const profile = await this.profileRepository.findByUserId(userId);
      return { ...baseData, profile };
    }

    if (user.role === EUserRole.RECRUITER) {
      const profile = await this.profileRepository.findByUserId(userId);
      const company = await this.companyRepository.findByUserId(userId);
      return { ...baseData, profile, company };
    }

    if (user.role === EUserRole.ADMIN) {
      return baseData;
    }

    return baseData;
  }
}
