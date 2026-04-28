import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { IRequestGetCareerCategoriesDto } from 'src/application/dtos/career-category/req.career-category.dto';

@Injectable()
export class GetAllCareerCategoriesUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(GetAllCareerCategoriesUseCase.name));
  }

  async execute(options: IRequestGetCareerCategoriesDto) {
    return this.runSafe('[Get Career Categories]:', async () => {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const result = await this.careerCategoryRepository.find({
        pagination: { page, limit },
        filter: { q: options?.q, id: options?.id },
        sort: { sortBy: options?.sortBy, sortOrder: options?.sortOrder },
      });
      return {
        data: result.data,
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    });
  }
}
