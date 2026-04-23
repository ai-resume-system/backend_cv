import { Injectable, Logger } from '@nestjs/common';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type {
  ICreateCVDto,
  ICVResponseDto,
} from 'src/application/dtos/cv/req.cv.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class CreateCVUseCase extends BaseUsecase {
  constructor(private readonly cvRepository: ICVRepository) {
    super(new Logger(CreateCVUseCase.name));
  }

  async execute(dto: ICreateCVDto): Promise<ICVResponseDto> {
    return this.runSafe(
      'CreateCV',
      async () => {
        const cv = await this.cvRepository.create(dto);
        return cv as ICVResponseDto;
      },
      ERROR_CODES.CV_CREATE_FAILED,
    );
  }
}
