import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { UpdateCareerCategoryDto } from '../../dtos/career-category/req.career-category.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class UpdateCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(UpdateCareerCategoryUseCase.name));
  }

  async execute(id: string, dto: UpdateCareerCategoryDto) {
    try {
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
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('[Update Career]:', error);
      throw new AppException(
        ERROR_CODES.CAREER_CATEGORY_UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
