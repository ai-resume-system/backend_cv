import { Module } from '@nestjs/common';
import { AuthController } from 'src/presentation/auth/controller/auth.controller';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RegisterUseCase } from 'src/application/use-cases/auth/register.usecase';
import { VerifyOtpUseCase } from 'src/application/use-cases/auth/verify-otp.usecase';
import { SendOtpUseCase } from 'src/application/use-cases/auth/send-otp.usecase';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { ForgotPasswordUseCase } from 'src/application/use-cases/auth/forgot-password.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { UsersModule } from './users.module';
import { JwtAuthModule } from '../common/guards/jwt-auth.module';

@Module({
  imports: [UsersModule, JwtAuthModule],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyOtpUseCase,
    SendOtpUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    LogoutUseCase,
    RedisAdapter,
    MailService,
  ],
})
export class AuthModule {}
