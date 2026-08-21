import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetRecommendedJobsQuery } from 'src/application/queries/cv-analysis/get-recommended-jobs.query';
import { GetCVAnalysisQuery } from 'src/application/queries/cv-analysis/get-cv-analysis.query';
import { AnalyzeCVUseCase } from 'src/application/use-cases/cv-analysis/analyze-cv.usecase';
import { PreviewTempCVAnalysisUseCase } from 'src/application/use-cases/cv-analysis/preview-temp-cv-analysis.usecase';
import { SaveTempCVAnalysisUseCase } from 'src/application/use-cases/cv-analysis/save-temp-cv-analysis.usecase';
import { UploadTempCVAnalysisUseCase } from 'src/application/use-cases/cv-analysis/upload-temp-cv-analysis.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CareerCategoryOrmEntity } from 'src/infrastructure/database/entities/career-category.orm-entity';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { CVParsedDataOrmEntity } from 'src/infrastructure/database/entities/cv-parsed-data.orm-entity';
import { CVSkillOrmEntity } from 'src/infrastructure/database/entities/cv-skill.orm-entity';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { FavouriteJobOrmEntity } from 'src/infrastructure/database/entities/favourite-job.orm-entity';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { JobSkillOrmEntity } from 'src/infrastructure/database/entities/job-skill.orm-entity';
import { SkillOrmEntity } from 'src/infrastructure/database/entities/skill.orm-entity';
import { CareerCategoryTypeormRepository } from 'src/infrastructure/database/repositories/career-category.typeorm-repository';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { CVParsedDataTypeormRepository } from 'src/infrastructure/database/repositories/cv-parsed-data.typeorm-repository';
import { CVSkillTypeormRepository } from 'src/infrastructure/database/repositories/cv-skill.typeorm-repository';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { FavouriteJobTypeormRepository } from 'src/infrastructure/database/repositories/favourite-job.typeorm-repository';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobSkillTypeormRepository } from 'src/infrastructure/database/repositories/job-skill.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { SkillTypeormRepository } from 'src/infrastructure/database/repositories/skill.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { CVAnalysisController } from './controller/cv-analysis.controller';
import { CVAnalysisPreviewController } from './controller/cv-analysis-preview.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CVOrmEntity,
      CompanyOrmEntity,
      CareerCategoryOrmEntity,
      CVParsedDataOrmEntity,
      CVSkillOrmEntity,
      FavouriteJobOrmEntity,
      JobApplicationOrmEntity,
      JobOrmEntity,
      JobSkillOrmEntity,
      SkillOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
    StorageModule,
  ],
  controllers: [CVAnalysisController, CVAnalysisPreviewController],
  providers: [
    GetCVAnalysisQuery,
    GetRecommendedJobsQuery,
    AnalyzeCVUseCase,
    UploadTempCVAnalysisUseCase,
    PreviewTempCVAnalysisUseCase,
    SaveTempCVAnalysisUseCase,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
    {
      provide: 'ICareerCategoryRepository',
      useClass: CareerCategoryTypeormRepository,
    },
    {
      provide: 'ICVParsedDataRepository',
      useClass: CVParsedDataTypeormRepository,
    },
    { provide: 'ICVSkillRepository', useClass: CVSkillTypeormRepository },
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    { provide: 'IJobSkillRepository', useClass: JobSkillTypeormRepository },
    { provide: 'ISkillRepository', useClass: SkillTypeormRepository },
    {
      provide: 'IFavouriteJobRepository',
      useClass: FavouriteJobTypeormRepository,
    },
    {
      provide: 'IJobApplicationRepository',
      useClass: JobApplicationTypeormRepository,
    },
  ],
})
export class CVAnalysisModule {}
