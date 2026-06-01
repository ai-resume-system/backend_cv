import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCompaniesQuery } from 'src/application/queries/company/get-companies.query';
import { GetCompanyBySlugQuery } from 'src/application/queries/company/get-company-by-slug.query';
import { GetCompanyJobsQuery } from 'src/application/queries/company/get-company-jobs.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CareerCategoryOrmEntity } from 'src/infrastructure/database/entities/career-category.orm-entity';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { FavouriteJobOrmEntity } from 'src/infrastructure/database/entities/favourite-job.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { SkillOrmEntity } from 'src/infrastructure/database/entities/skill.orm-entity';
import { CareerCategoryTypeormRepository } from 'src/infrastructure/database/repositories/career-category.typeorm-repository';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { FavouriteJobTypeormRepository } from 'src/infrastructure/database/repositories/favourite-job.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { SkillTypeormRepository } from 'src/infrastructure/database/repositories/skill.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { CompanyController } from './controller/company.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyOrmEntity,
      JobOrmEntity,
      CareerCategoryOrmEntity,
      FavouriteJobOrmEntity,
      SkillOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
    StorageModule,
  ],
  controllers: [CompanyController],
  providers: [
    GetCompaniesQuery,
    GetCompanyBySlugQuery,
    GetCompanyJobsQuery,
    GetJobsQuery,
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    {
      provide: 'ICareerCategoryRepository',
      useClass: CareerCategoryTypeormRepository,
    },
    {
      provide: 'IFavouriteJobRepository',
      useClass: FavouriteJobTypeormRepository,
    },
    { provide: 'ISkillRepository', useClass: SkillTypeormRepository },
  ],
})
export class CompanyModule {}
