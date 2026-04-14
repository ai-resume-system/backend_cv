import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthModule } from './common/guards/jwt-auth.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { CareerCategoriesModule } from './modules/career-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    RedisModule,
    MailModule,
    JwtAuthModule,
    AuthModule,
    UsersModule,
    CareerCategoriesModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
