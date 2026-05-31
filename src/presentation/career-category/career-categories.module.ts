import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCareerCategoriesQuery } from 'src/application/queries/career-categories/get-career-categories.query';
import { GetTopCareerCategoriesQuery } from 'src/application/queries/career-categories/get-top-career-categories.query';
import { CreateCareerCategoryUseCase } from 'src/application/use-cases/career-category/create-career-category.usecase';
import { UpdateCareerCategoryUseCase } from 'src/application/use-cases/career-category/update-career-category.usecase';
import { DeleteCareerCategoryUseCase } from 'src/application/use-cases/career-category/delete-career-category.usecase';
import { CareerCategoryTypeormRepository } from 'src/infrastructure/database/repositories/career-category.typeorm-repository';
import { CareerCategoryOrmEntity } from 'src/infrastructure/database/entities/career-category.orm-entity';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { GetCareerCategoryBySlugQuery } from 'src/application/queries/career-categories/get-career-category-by-slug.query';
import { SkillModule } from 'src/presentation/skill/skill.module';
import { CareerCategoryAdminController } from './controller/career-category-admin.controller';
import { CareerCategoryPublicController } from './controller/career-category-public.controller';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CareerCategoryOrmEntity,
      CompanyOrmEntity,
      JobOrmEntity,
    ]),
    JwtAuthModule,
    SkillModule,
  ],
  controllers: [CareerCategoryPublicController, CareerCategoryAdminController],
  providers: [
    GetCareerCategoriesQuery,
    GetTopCareerCategoriesQuery,
    GetCareerCategoryBySlugQuery,
    CreateCareerCategoryUseCase,
    UpdateCareerCategoryUseCase,
    DeleteCareerCategoryUseCase,
    CareerCategoryTypeormRepository,
    {
      provide: 'ICareerCategoryRepository',
      useClass: CareerCategoryTypeormRepository,
    },
    CompanyTypeormRepository,
    {
      provide: 'ICompanyRepository',
      useClass: CompanyTypeormRepository,
    },
    JobTypeormRepository,
    {
      provide: 'IJobRepository',
      useClass: JobTypeormRepository,
    },
  ],
  exports: ['ICareerCategoryRepository'],
})
export class CareerCategoriesModule {}
