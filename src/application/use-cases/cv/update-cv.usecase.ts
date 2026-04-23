import { Injectable, Logger } from '@nestjs/common';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type {
  IUpdateCVDto,
  ICVResponseDto,
} from 'src/application/dtos/cv/req.cv.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class UpdateCVUseCase extends BaseUsecase {
  constructor(private readonly cvRepository: ICVRepository) {
    super(new Logger(UpdateCVUseCase.name));
  }

  async execute(id: string, dto: IUpdateCVDto): Promise<ICVResponseDto> {
    return this.runSafe(
      'UpdateCV',
      async () => {
        const cv = await this.cvRepository.update(id, dto);
        if (!cv) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }
        return cv as ICVResponseDto;
      },
      ERROR_CODES.CV_UPDATE_FAILED,
    );
  }
}
