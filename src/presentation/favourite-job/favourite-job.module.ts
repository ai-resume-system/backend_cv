import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetFavouriteJobsQuery } from 'src/application/queries/favourite-job/get-favourite-jobs.query';
import { AddFavouriteJobUseCase } from 'src/application/use-cases/favourite-job/add-favourite-job.usecase';
import { RemoveFavouriteJobUseCase } from 'src/application/use-cases/favourite-job/remove-favourite-job.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CareerCategoryOrmEntity } from 'src/infrastructure/database/entities/career-category.orm-entity';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { FavouriteJobOrmEntity } from 'src/infrastructure/database/entities/favourite-job.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { CareerCategoryTypeormRepository } from 'src/infrastructure/database/repositories/career-category.typeorm-repository';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { FavouriteJobTypeormRepository } from 'src/infrastructure/database/repositories/favourite-job.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { FavouriteJobController } from './controller/favourite-job.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavouriteJobOrmEntity,
      JobOrmEntity,
      CompanyOrmEntity,
      CareerCategoryOrmEntity,
    ]),
    JwtAuthModule,
    StorageModule,
  ],
  controllers: [FavouriteJobController],
  providers: [
    AddFavouriteJobUseCase,
    RemoveFavouriteJobUseCase,
    GetFavouriteJobsQuery,
    {
      provide: 'IFavouriteJobRepository',
      useClass: FavouriteJobTypeormRepository,
    },
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
    {
      provide: 'ICareerCategoryRepository',
      useClass: CareerCategoryTypeormRepository,
    },
  ],
  exports: [
    'IFavouriteJobRepository',
    'IJobRepository',
    'ICompanyRepository',
    'ICareerCategoryRepository',
  ],
})
export class FavouriteJobModule {}
