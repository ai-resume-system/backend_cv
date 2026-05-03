import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';

@Injectable()
export class GetCareerCategoryByIdQuery extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(GetCareerCategoryByIdQuery.name));
  }

  async execute(id: string): Promise<IResponseApiCareerCategoryDto> {
    return this.runSafe('[Get Career Categories By Id]:', async () => {
      const result = await this.careerCategoryRepository.findById(id);
      if (!result)
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      return { data: result };
    });
  }
}
