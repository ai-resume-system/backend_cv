import { Module } from '@nestjs/common';
import { AccountController } from 'src/presentation/account/controller/account.controller';
import { GetMyProfileQuery } from 'src/application/queries/account/get-my-profile.query';
import { UpdateMyProfileUseCase } from 'src/application/use-cases/account/update-my-profile.usecase';
import { UpdateMyCompanyUseCase } from 'src/application/use-cases/account/update-my-company.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/account/change-password.usecase';
import { UsersModule } from '../user/users.module';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [UsersModule, JwtAuthModule, AuthModule, StorageModule],
  controllers: [AccountController],
  providers: [
    GetMyProfileQuery,
    UpdateMyProfileUseCase,
    UpdateMyCompanyUseCase,
    ChangePasswordUseCase,
  ],
})
export class AccountModule {}
