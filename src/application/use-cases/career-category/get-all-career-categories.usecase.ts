import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class GetAllCareerCategoriesUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(GetAllCareerCategoriesUseCase.name));
  }

  async execute() {
    return this.careerCategoryRepository.findAll();
  }
}
