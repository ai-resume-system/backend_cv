import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVEntity } from 'src/domain/entities/cv.entity';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class SetDefaultCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(SetDefaultCVUseCase.name));
  }

  async execute(cvId: string, userId: string): Promise<{ data: ICVEntity }> {
    return this.runSafe('[Set Default CV]:', async () => {
      const cv = await this.cvRepository.findById(cvId);
      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const updated = await this.cvRepository.setDefault(cvId, userId);

      await this.queueDispatch.dispatchCacheInvalidation({
        prefixes: [`cv:list:user:${userId}:`],
      });

      return { data: updated };
    });
  }
}
