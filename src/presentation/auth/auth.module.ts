import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/presentation/auth/controller/auth.controller';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RegisterUseCase } from 'src/application/use-cases/auth/register.usecase';
import { VerifyOtpUseCase } from 'src/application/use-cases/auth/verify-otp.usecase';
import { SendOtpUseCase } from 'src/application/use-cases/auth/send-otp.usecase';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { ForgotPasswordUseCase } from 'src/application/use-cases/auth/forgot-password.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { RefreshTokenOrmEntity } from 'src/infrastructure/database/entities/refresh-token.orm-entity';
import { OtpCodeOrmEntity } from 'src/infrastructure/database/entities/otp-code.orm-entity';
import { RegistrationSessionOrmEntity } from 'src/infrastructure/database/entities/registration-session.orm-entity';
import { PasswordResetTokenOrmEntity } from 'src/infrastructure/database/entities/password-reset-token.orm-entity';
import { RefreshTokenTypeormRepository } from 'src/infrastructure/database/repositories/refresh-token.typeorm-repository';
import { OtpCodeTypeormRepository } from 'src/infrastructure/database/repositories/otp-code.typeorm-repository';
import { RegistrationSessionTypeormRepository } from 'src/infrastructure/database/repositories/registration-session.typeorm-repository';
import { PasswordResetTokenTypeormRepository } from 'src/infrastructure/database/repositories/password-reset-token.typeorm-repository';

import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { UsersModule } from '../user/users.module';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';

@Module({
  imports: [
    UsersModule,
    JwtAuthModule,
    RedisModule,
    TypeOrmModule.forFeature([
      RefreshTokenOrmEntity,
      OtpCodeOrmEntity,
      RegistrationSessionOrmEntity,
      PasswordResetTokenOrmEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyOtpUseCase,
    SendOtpUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    LogoutUseCase,
    MailService,
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenTypeormRepository,
    },
    {
      provide: 'IOtpCodeRepository',
      useClass: OtpCodeTypeormRepository,
    },
    {
      provide: 'IRegistrationSessionRepository',
      useClass: RegistrationSessionTypeormRepository,
    },
    {
      provide: 'IPasswordResetTokenRepository',
      useClass: PasswordResetTokenTypeormRepository,
    },
  ],
  exports: [
    'IRefreshTokenRepository',
    'IOtpCodeRepository',
    'IRegistrationSessionRepository',
    'IPasswordResetTokenRepository',
  ],
})
export class AuthModule {}
