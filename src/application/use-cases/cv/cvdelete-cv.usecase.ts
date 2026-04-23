import { Injectable, Logger } from '@nestjs/common';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class DeleteCVUseCase extends BaseUsecase {
  constructor(private readonly cvRepository: ICVRepository) {
    super(new Logger(DeleteCVUseCase.name));
  }

  async execute(id: string): Promise<void> {
    return this.runSafe(
      'Delete CV',
      async () => {
        const cv = await this.cvRepository.findById(id);
        if (!cv) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }
        await this.cvRepository.delete(id);
      },
      ERROR_CODES.CV_DELETE_FAILED,
    );
  }
}
