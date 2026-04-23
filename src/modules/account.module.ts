import { Module } from '@nestjs/common';
import { AccountController } from 'src/presentation/account/controller/account.controller';
import { GetMyProfileUseCase } from 'src/application/use-cases/account/get-my-profile.usecase';
import { UpdateMyProfileUseCase } from 'src/application/use-cases/account/update-my-profile.usecase';
import { UpdateMyCompanyUseCase } from 'src/application/use-cases/account/update-my-company.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/account/change-password.usecase';
import { UsersModule } from './users.module';
import { JwtAuthModule } from '../common/guards/jwt-auth.module';

@Module({
  imports: [UsersModule, JwtAuthModule],
  controllers: [AccountController],
  providers: [
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    UpdateMyCompanyUseCase,
    ChangePasswordUseCase,
  ],
})
export class AccountModule {}
