import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetJobBySlugQuery } from 'src/application/queries/job/get-job-by-slug.query';
import { GetJobMatchQuery } from 'src/application/queries/job/get-job-match.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { GetRelatedJobsQuery } from 'src/application/queries/job/get-related-jobs.query';
import { CalculateJobMatchUseCase } from 'src/application/use-cases/job/calculate-job-match.usecase';
import { CreateJobUseCase } from 'src/application/use-cases/job/create-job.usecase';
import { DeleteJobUseCase } from 'src/application/use-cases/job/delete-job.usecase';
import { ReviewJobUseCase } from 'src/application/use-cases/job/review-job.usecase';
import { UpdateJobUseCase } from 'src/application/use-cases/job/update-job.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { CVParsedDataOrmEntity } from 'src/infrastructure/database/entities/cv-parsed-data.orm-entity';
import { CVSkillOrmEntity } from 'src/infrastructure/database/entities/cv-skill.orm-entity';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { JobMatchOrmEntity } from 'src/infrastructure/database/entities/job-match.orm-entity';
import { JobSkillOrmEntity } from 'src/infrastructure/database/entities/job-skill.orm-entity';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { CVParsedDataTypeormRepository } from 'src/infrastructure/database/repositories/cv-parsed-data.typeorm-repository';
import { CVSkillTypeormRepository } from 'src/infrastructure/database/repositories/cv-skill.typeorm-repository';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobMatchTypeormRepository } from 'src/infrastructure/database/repositories/job-match.typeorm-repository';
import { JobSkillTypeormRepository } from 'src/infrastructure/database/repositories/job-skill.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { CareerCategoriesModule } from 'src/presentation/career-category/career-categories.module';
import { JobAdminController } from 'src/presentation/job/controller/job-admin.controller';
import { JobPublicController } from 'src/presentation/job/controller/job-public.controller';
import { JobRecruiterController } from 'src/presentation/job/controller/job-recruiter.controller';
import { FavouriteJobOrmEntity } from 'src/infrastructure/database/entities/favourite-job.orm-entity';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { FavouriteJobTypeormRepository } from 'src/infrastructure/database/repositories/favourite-job.typeorm-repository';
import { SkillModule } from 'src/presentation/skill/skill.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobOrmEntity,
      CompanyOrmEntity,
      CVOrmEntity,
      CVParsedDataOrmEntity,
      CVSkillOrmEntity,
      JobMatchOrmEntity,
      JobSkillOrmEntity,
      FavouriteJobOrmEntity,
      JobApplicationOrmEntity,
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
    GetJobMatchQuery,
    GetRelatedJobsQuery,
    CalculateJobMatchUseCase,
    CreateJobUseCase,
    UpdateJobUseCase,
    DeleteJobUseCase,
    ReviewJobUseCase,
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
    {
      provide: 'ICVParsedDataRepository',
      useClass: CVParsedDataTypeormRepository,
    },
    { provide: 'ICVSkillRepository', useClass: CVSkillTypeormRepository },
    { provide: 'IJobSkillRepository', useClass: JobSkillTypeormRepository },
    { provide: 'IJobMatchRepository', useClass: JobMatchTypeormRepository },
    {
      provide: 'IFavouriteJobRepository',
      useClass: FavouriteJobTypeormRepository,
    },
    {
      provide: 'IFavouriteRepository',
      useClass: FavouriteJobTypeormRepository,
    },
    {
      provide: 'IJobApplicationRepository',
      useClass: JobApplicationTypeormRepository,
    },
  ],
  exports: [
    'IJobRepository',
    'ICompanyRepository',
    'IFavouriteJobRepository',
    'IJobApplicationRepository',
  ],
})
export class JobsModule {}
