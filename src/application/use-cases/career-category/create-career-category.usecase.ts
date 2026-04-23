import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { IRequestCreateCareerCategoryDto } from '../../dtos/career-category/req.career-category.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

@Injectable()
export class CreateCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(CreateCareerCategoryUseCase.name));
  }

  async execute(dto: IRequestCreateCareerCategoryDto) {
    return this.runSafe('Create Career Category', async () => {
      const existing = await this.careerCategoryRepository.findByName(dto.name);
      if (existing) {
        throw new AppException(
          ERROR_CODES.CAREER_CATEGORY_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      const created = await this.careerCategoryRepository.create({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        status: ECareerCategoriesStatus.ACTIVE,
      });
      return created;
    });
  }
}
