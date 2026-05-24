import { Module } from '@nestjs/common';
import { AccountController } from 'src/presentation/account/controller/account.controller';
import { GetMyProfileQuery } from 'src/application/queries/account/get-my-profile.query';
import { UpdateMyProfileUseCase } from 'src/application/use-cases/account/update-my-profile.usecase';
import { UpdateMyCompanyUseCase } from 'src/application/use-cases/account/update-my-company.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/account/change-password.usecase';
import { DeleteAvatarUseCase } from 'src/application/use-cases/account/delete-avatar.usecase';
import { DeleteCompanyLogoUseCase } from 'src/application/use-cases/account/delete-company-logo.usecase';
import { DeleteCompanyBannerUseCase } from 'src/application/use-cases/account/delete-company-banner.usecase';
import { UsersModule } from '../user/users.module';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from 'src/infrastructure/queue/queue.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [UsersModule, JwtAuthModule, AuthModule, StorageModule, QueueModule],
  controllers: [AccountController],
  providers: [
    GetMyProfileQuery,
    UpdateMyProfileUseCase,
    UpdateMyCompanyUseCase,
    ChangePasswordUseCase,
    DeleteAvatarUseCase,
    DeleteCompanyLogoUseCase,
    DeleteCompanyBannerUseCase,
  ],
})
export class AccountModule {}
