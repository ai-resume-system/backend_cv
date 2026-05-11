import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetJobApplicationsByJobQuery } from 'src/application/queries/job-application/get-job-applications-by-job.query';
import { GetMyJobApplicationsQuery } from 'src/application/queries/job-application/get-my-job-applications.query';
import { CreateJobApplicationUseCase } from 'src/application/use-cases/job-application/create-job-application.usecase';
import { UpdateJobApplicationStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-status.usecase';
import { WithdrawJobApplicationUseCase } from 'src/application/use-cases/job-application/withdraw-job-application.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobApplicationController } from './controller/job-application.controller';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplicationOrmEntity,
      CVOrmEntity,
      JobOrmEntity,
    ]),
    JwtAuthModule,
  ],
  controllers: [JobApplicationController],
  providers: [
    CreateJobApplicationUseCase,
    WithdrawJobApplicationUseCase,
    UpdateJobApplicationStatusUseCase,
    GetMyJobApplicationsQuery,
    GetJobApplicationsByJobQuery,
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
  ],
  exports: ['IJobApplicationRepository', 'ICVRepository', 'IJobRepository'],
})
export class JobApplicationModule {}
