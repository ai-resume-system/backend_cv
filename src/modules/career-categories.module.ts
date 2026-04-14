import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerCategoryController } from 'src/presentation/career-category/controller/career-category.controller';
import { CreateCareerCategoryUseCase } from 'src/application/use-cases/career-category/create-career-category.usecase';
import { GetAllCareerCategoriesUseCase } from 'src/application/use-cases/career-category/get-all-career-categories.usecase';
import { UpdateCareerCategoryUseCase } from 'src/application/use-cases/career-category/update-career-category.usecase';
import { DeleteCareerCategoryUseCase } from 'src/application/use-cases/career-category/delete-career-category.usecase';
import { CareerCategoryTypeormRepository } from 'src/infrastructure/database/repositories/career-category.typeorm-repository';
import { CareerCategoryOrmEntity } from 'src/infrastructure/database/entities/career-category.orm-entity';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CareerCategoryOrmEntity]), JwtAuthModule],
  controllers: [CareerCategoryController],
  providers: [
    CreateCareerCategoryUseCase,
    GetAllCareerCategoriesUseCase,
    UpdateCareerCategoryUseCase,
    DeleteCareerCategoryUseCase,
    CareerCategoryTypeormRepository,
    {
      provide: 'ICareerCategoryRepository',
      useClass: CareerCategoryTypeormRepository,
    },
  ],
  exports: ['ICareerCategoryRepository'],
})
export class CareerCategoriesModule {}
