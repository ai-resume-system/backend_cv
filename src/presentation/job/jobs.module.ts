import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetJobBySlugQuery } from 'src/application/queries/job/get-job-by-slug.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { CreateJobUseCase } from 'src/application/use-cases/job/create-job.usecase';
import { DeleteJobUseCase } from 'src/application/use-cases/job/delete-job.usecase';
import { ReviewJobUseCase } from 'src/application/use-cases/job/review-job.usecase';
import { UpdateJobUseCase } from 'src/application/use-cases/job/update-job.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { CareerCategoriesModule } from 'src/presentation/career-category/career-categories.module';
import { JobAdminController } from 'src/presentation/job/controller/job-admin.controller';
import { JobPublicController } from 'src/presentation/job/controller/job-public.controller';
import { JobRecruiterController } from 'src/presentation/job/controller/job-recruiter.controller';
import { FavouriteJobOrmEntity } from 'src/infrastructure/database/entities/favourite-job.orm-entity';
import { FavouriteJobTypeormRepository } from 'src/infrastructure/database/repositories/favourite-job.typeorm-repository';
import { SkillModule } from 'src/presentation/skill/skill.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobOrmEntity,
      CompanyOrmEntity,
      FavouriteJobOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
    CareerCategoriesModule,
    SkillModule,
    StorageModule,
  ],
  controllers: [
    JobPublicController,
    JobRecruiterController,
    JobAdminController,
  ],
  providers: [
    GetJobsQuery,
    GetJobBySlugQuery,
    CreateJobUseCase,
    UpdateJobUseCase,
    DeleteJobUseCase,
    ReviewJobUseCase,
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
    {
      provide: 'IFavouriteJobRepository',
      useClass: FavouriteJobTypeormRepository,
    },
    {
      provide: 'IFavouriteRepository',
      useClass: FavouriteJobTypeormRepository,
    },
  ],
  exports: ['IJobRepository', 'ICompanyRepository', 'IFavouriteJobRepository'],
})
export class JobsModule {}
