import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthModule } from './common/guards/jwt-auth.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { RedisModule } from './infrastructure/redis/redis.module';

import { QueueModule } from './infrastructure/queue/queue.module';
import { AuthModule } from './presentation/auth/auth.module';
import { AccountModule } from './presentation/account/account.module';
import { CareerCategoriesModule } from './presentation/career-category/career-categories.module';
import { UsersModule } from './presentation/user/users.module';
import { CVModule } from './presentation/cv/cv.module';
import { CVAnalysisModule } from './presentation/cv-analysis/cv-analysis.module';
import { JobsModule } from './presentation/job/jobs.module';
import { JobApplicationModule } from './presentation/job-application/job-application.module';
import { UploadModule } from './presentation/upload/upload.module';
import { ConfigModule } from './common/config/config.module';
import { SkillModule } from './presentation/skill/skill.module';
import { FavouriteJobModule } from './presentation/favourite-job/favourite-job.module';
import { CompanyModule } from './presentation/company/company.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    RedisModule,
    MailModule,
    JwtAuthModule,
    QueueModule,
    AuthModule,
    AccountModule,
    UploadModule,
    CompanyModule,
    CareerCategoriesModule,
    UsersModule,
    JobsModule,
    CVModule,
    CVAnalysisModule,
    SkillModule,
    FavouriteJobModule,
    JobApplicationModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
