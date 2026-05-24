import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateMyProfileDto } from 'src/application/dtos/account/req.account.dto';
import type { IResponseMyProfileDto } from 'src/application/dtos/account/res.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class UpdateMyProfileUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(UpdateMyProfileUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestUpdateMyProfileDto,
  ): Promise<IResponseMyProfileDto> {
    return this.runSafe('[Update My Profile]:', async () => {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const { phone, fullName, bio } = dto;

      const updatedUser =
        phone !== undefined
          ? await this.userRepository.updateProfile(userId, { phone })
          : user;

      const hasProfileFields = fullName !== undefined || bio !== undefined;

      const updatedProfile = hasProfileFields
        ? await this.profileRepository.updateWithUserId(userId, {
            fullName,
            bio,
          })
        : profile;

      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`, `user:detail:${userId}`],
        prefixes: ['user:list:'],
      });

      return {
        phone: updatedUser.phone,
        fullName: updatedProfile.fullName,
        bio: updatedProfile.bio,
      };
    });
  }
}
