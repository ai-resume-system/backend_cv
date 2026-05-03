import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
import { JobsModule } from './presentation/job/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    RedisModule,
    MailModule,
    JwtAuthModule,
    QueueModule,
    AuthModule,
    AccountModule,
    CareerCategoriesModule,
    UsersModule,
    CVModule,
    JobsModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
