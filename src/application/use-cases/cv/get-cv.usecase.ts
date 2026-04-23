import { Injectable, Logger } from '@nestjs/common';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVResponseDto } from 'src/application/dtos/cv/req.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class GetCVUseCase extends BaseUsecase {
  constructor(private readonly cvRepository: ICVRepository) {
    super(new Logger(GetCVUseCase.name));
  }

  async execute(id: string): Promise<ICVResponseDto | null> {
    return (await this.cvRepository.findById(id)) as ICVResponseDto | null;
  }
}
