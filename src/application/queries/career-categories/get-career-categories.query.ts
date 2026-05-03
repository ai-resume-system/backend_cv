import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetCareerCategoriesDto } from 'src/application/dtos/career-category/req.career-category.dto';
import { IResponseListApiCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';

@Injectable()
export class GetCareerCategoriesQuery extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(GetCareerCategoriesQuery.name));
  }

  async execute(
    dto: IRequestGetCareerCategoriesDto,
  ): Promise<IResponseListApiCareerCategoryDto> {
    return this.runSafe('[Get Career Categories]:', async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        q,
      } = dto;
      const result = await this.careerCategoryRepository.find({
        pagination: { page, limit },
        filter: { q },
        sort: { sortBy, sortOrder },
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
