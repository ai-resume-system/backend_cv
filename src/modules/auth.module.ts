import { Module } from '@nestjs/common';
import { AuthController } from 'src/presentation/auth/controller/auth.controller';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RegisterUseCase } from 'src/application/use-cases/auth/register.usecase';
import { VerifyOtpUseCase } from 'src/application/use-cases/auth/verify-otp.usecase';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/auth/change-password.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { GetProfileUseCase } from 'src/application/use-cases/auth/get-profile.usecase';
import { UsersModule } from './users.module';
import { RolesModule } from './roles.module';
import { JwtAuthModule } from 'src/infrastructure/auth/jwt-auth.module';

@Module({
  imports: [UsersModule, RolesModule, JwtAuthModule],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyOtpUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    LogoutUseCase,
    GetProfileUseCase,
    RedisAdapter,
    MailService,
  ],
})
export class AuthModule {}
