import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetAdminApplicationGrowthQuery } from 'src/application/queries/admin-analytics/get-admin-application-growth.query';
import { GetAdminJobGrowthQuery } from 'src/application/queries/admin-analytics/get-admin-job-growth.query';
import { GetAdminOverviewQuery } from 'src/application/queries/admin-analytics/get-admin-overview.query';
import { GetAdminRecentActivitiesQuery } from 'src/application/queries/admin-analytics/get-admin-recent-activities.query';
import { GetAdminUserGrowthQuery } from 'src/application/queries/admin-analytics/get-admin-user-growth.query';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { JobOrmEntity } from 'src/infrastructure/database/entities/job.orm-entity';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { JobTypeormRepository } from 'src/infrastructure/database/repositories/job.typeorm-repository';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { AdminAnalyticsController } from './controller/admin-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      JobOrmEntity,
      JobApplicationOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
  ],
  controllers: [AdminAnalyticsController],
  providers: [
    GetAdminOverviewQuery,
    GetAdminUserGrowthQuery,
    GetAdminJobGrowthQuery,
    GetAdminApplicationGrowthQuery,
    GetAdminRecentActivitiesQuery,
    { provide: 'IUserRepository', useClass: UserTypeormRepository },
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    {
      provide: 'IJobApplicationRepository',
      useClass: JobApplicationTypeormRepository,
    },
  ],
})
export class AdminAnalyticsModule {}
