import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetRecruiterApplicationTrendQuery } from 'src/application/queries/recruiter-analytics/get-recruiter-application-trend.query';
import { GetRecruiterOverviewQuery } from 'src/application/queries/recruiter-analytics/get-recruiter-overview.query';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { RecruiterAnalyticsController } from './controller/recruiter-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyOrmEntity,
      JobOrmEntity,
      JobApplicationOrmEntity,
    ]),
    JwtAuthModule,
  ],
  controllers: [RecruiterAnalyticsController],
  providers: [
    GetRecruiterOverviewQuery,
    GetRecruiterApplicationTrendQuery,
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    {
      provide: 'IJobApplicationRepository',
      useClass: JobApplicationTypeormRepository,
    },
  ],
})
export class RecruiterAnalyticsModule {}
