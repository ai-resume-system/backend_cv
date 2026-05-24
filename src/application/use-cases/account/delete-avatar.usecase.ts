import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class DeleteAvatarUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(DeleteAvatarUseCase.name));
  }

  async execute(
    userId: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return this.runSafe('[Delete Avatar]:', async () => {
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const currentAvatarUrl = profile.avatarUrl;

      await this.profileRepository.updateWithUserId(userId, {
        avatarUrl: null,
      });

      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`account:profile:${userId}`],
        prefixes: [],
      });

      if (currentAvatarUrl && !/^https?:\/\//i.test(currentAvatarUrl)) {
        await this.queueDispatch.dispatchStorageDelete({
          bucketType: EBucketType.AVATAR,
          objectKey: currentAvatarUrl,
          reason: 'avatar.deleted',
          aggregateId: userId,
        });
      }

      return {
        data: {
          success: true,
          message: 'Avatar deleted successfully',
        },
      };
    });
  }
}
