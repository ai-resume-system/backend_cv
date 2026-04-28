import { Injectable, Logger } from '@nestjs/common';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVResponseDto } from 'src/application/dtos/cv/req.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class GetAllCVsUseCase extends BaseUsecase {
  constructor(private readonly cvRepository: ICVRepository) {
    super(new Logger(GetAllCVsUseCase.name));
  }

  async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const result = await this.cvRepository.find({ pagination: { page, limit } });
    return {
      data: result.data as ICVResponseDto[],
      pagination: {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
        page,
        limit,
      },
    };
  }
}
