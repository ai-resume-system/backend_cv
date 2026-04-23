import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { IRequestUpdateCareerCategoryDto } from '../../dtos/career-category/req.career-category.dto';

@Injectable()
export class UpdateCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(UpdateCareerCategoryUseCase.name));
  }

  async execute(id: string, dto: IRequestUpdateCareerCategoryDto) {
    return this.runSafe('[Update Career Category]:', async () => {
      const existing = await this.careerCategoryRepository.findById(id);
      if (!existing) {
        throw new AppException(
          ERROR_CODES.CAREER_CATEGORY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (dto.name) {
        const nameExists = await this.careerCategoryRepository.findByName(
          dto.name,
        );
        if (nameExists && nameExists.id !== id) {
          throw new AppException(
            ERROR_CODES.CAREER_CATEGORY_ALREADY_EXISTS,
            HttpStatus.CONFLICT,
          );
        }
      }

      const updated = await this.careerCategoryRepository.update(id, dto);
      return updated;
    });
  }
}
