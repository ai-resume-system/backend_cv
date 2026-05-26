import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetJobApplicationByIdQuery } from 'src/application/queries/job-application/get-job-application-by-id.query';
import { GetJobApplicationsByJobQuery } from 'src/application/queries/job-application/get-job-applications-by-job.query';
import { GetMyJobApplicationsQuery } from 'src/application/queries/job-application/get-my-job-applications.query';
import { CreateJobApplicationUseCase } from 'src/application/use-cases/job-application/create-job-application.usecase';
import { UpdateJobApplicationStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-status.usecase';
import { WithdrawJobApplicationUseCase } from 'src/application/use-cases/job-application/withdraw-job-application.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobApplicationController } from './controller/job-application.controller';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { QueueModule } from 'src/infrastructure/queue/queue.module';
import { GetJobApplicationCVQuery } from 'src/application/queries/job-application/get-job-application-cv.querry';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplicationOrmEntity,
      CVOrmEntity,
      JobOrmEntity,
      CompanyOrmEntity,
      UserOrmEntity,
    ]),
    JwtAuthModule,
    QueueModule,
  ],
  controllers: [JobApplicationController],
  providers: [
    CreateJobApplicationUseCase,
    WithdrawJobApplicationUseCase,
    UpdateJobApplicationStatusUseCase,
    GetJobApplicationByIdQuery,
    GetMyJobApplicationsQuery,
    GetJobApplicationsByJobQuery,
    GetJobApplicationCVQuery,
    {
      provide: 'IJobApplicationRepository',
      useClass: JobApplicationTypeormRepository,
    },
    {
      provide: 'ICVRepository',
      useClass: CVTypeormRepository,
    },
    {
      provide: 'IJobRepository',
      useClass: JobTypeormRepository,
    },
    {
      provide: 'ICompanyRepository',
      useClass: CompanyTypeormRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserTypeormRepository,
    },
  ],
  exports: [
    'IJobApplicationRepository',
    'ICVRepository',
    'IJobRepository',
    'ICompanyRepository',
    'IUserRepository',
  ],
})
export class JobApplicationModule {}
