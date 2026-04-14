import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RolesGuard } from './role.guard';
import { JwtTokenUsecase } from 'src/application/use-cases/auth/jwt-token.usecase';
import { AuthenticationGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtTokenUsecase, AuthenticationGuard, RolesGuard],
  exports: [JwtTokenUsecase, AuthenticationGuard, RolesGuard, JwtModule],
})
export class JwtAuthModule {}
