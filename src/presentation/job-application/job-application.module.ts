import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetJobApplicationByIdQuery } from 'src/application/queries/job-application/get-job-application-by-id.query';
import { GetJobApplicationsByJobQuery } from 'src/application/queries/job-application/get-job-applications-by-job.query';
import { GetMyJobApplicationsQuery } from 'src/application/queries/job-application/get-my-job-applications.query';
import { GetRecruiterInterviewsQuery } from 'src/application/queries/job-application/get-recruiter-interviews.query';
import { GetRecruiterJobApplicationsQuery } from 'src/application/queries/job-application/get-recruiter-job-applications.query';
import { GetRecruiterNewApplicantsQuery } from 'src/application/queries/job-application/get-recruiter-new-applicants.query';
import { RecruiterJobApplicationQuerySupport } from 'src/application/queries/job-application/recruiter-job-application-query.support';
import { CreateJobApplicationUseCase } from 'src/application/use-cases/job-application/create-job-application.usecase';
import { UpdateJobApplicationInterviewStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-interview-status.usecase';
import { UpdateJobApplicationStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-status.usecase';
import { WithdrawJobApplicationUseCase } from 'src/application/use-cases/job-application/withdraw-job-application.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { CVParsedDataOrmEntity } from 'src/infrastructure/database/entities/cv-parsed-data.orm-entity';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { JobMatchOrmEntity } from 'src/infrastructure/database/entities/job-match.orm-entity';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { CVParsedDataTypeormRepository } from 'src/infrastructure/database/repositories/cv-parsed-data.typeorm-repository';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobMatchTypeormRepository } from 'src/infrastructure/database/repositories/job-match.typeorm-repository';
import { JobSeekerJobApplicationController } from './controller/job-seeker-job-application.controller';
import { RecruiterJobApplicationController } from './controller/recruiter-job-application.controller';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { QueueModule } from 'src/infrastructure/queue/queue.module';
import { GetJobApplicationCVQuery } from 'src/application/queries/job-application/get-job-application-cv.querry';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { UsersModule } from 'src/presentation/user/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplicationOrmEntity,
      CVOrmEntity,
      CVParsedDataOrmEntity,
      JobOrmEntity,
      JobMatchOrmEntity,
      CompanyOrmEntity,
      UserOrmEntity,
    ]),
    JwtAuthModule,
    QueueModule,
    StorageModule,
    RedisModule,
    UsersModule,
  ],
  controllers: [
    JobSeekerJobApplicationController,
    RecruiterJobApplicationController,
  ],
  providers: [
    CreateJobApplicationUseCase,
    WithdrawJobApplicationUseCase,
    UpdateJobApplicationStatusUseCase,
    UpdateJobApplicationInterviewStatusUseCase,
    GetJobApplicationByIdQuery,
    GetMyJobApplicationsQuery,
    GetJobApplicationsByJobQuery,
    GetRecruiterJobApplicationsQuery,
    GetRecruiterNewApplicantsQuery,
    GetRecruiterInterviewsQuery,
    RecruiterJobApplicationQuerySupport,
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
      provide: 'ICVParsedDataRepository',
      useClass: CVParsedDataTypeormRepository,
    },
    {
      provide: 'IJobRepository',
      useClass: JobTypeormRepository,
    },
    {
      provide: 'IJobMatchRepository',
      useClass: JobMatchTypeormRepository,
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
    'ICVParsedDataRepository',
    'IJobRepository',
    'ICompanyRepository',
    'IUserRepository',
  ],
})
export class JobApplicationModule {}
