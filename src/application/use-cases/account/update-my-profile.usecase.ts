import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { IRequestUpdateMyProfileDto } from 'src/application/dtos/account/req.account.dto';
import type { IResponseMyProfileDto } from 'src/application/dtos/account/res.account.dto';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class UpdateMyProfileUseCase extends BaseUsecase {
  constructor(
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
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const updated = await this.profileRepository.updateWithUserId(
        userId,
        dto,
      );
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`, `user:detail:${userId}`],
        prefixes: ['user:list:'],
      });
      return {
        id: updated.id,
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
      };
    });
  }
}
