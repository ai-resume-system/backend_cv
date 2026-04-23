import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { UserProfileOrmEntity } from 'src/infrastructure/database/entities/user_profile.orm-entity';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { UserProfileTypeormRepository } from 'src/infrastructure/database/repositories/user-profile.typeorm-repository';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { GetAllUsersUseCase } from 'src/application/use-cases/user/get-all-users.usecase';
import { GetUserByIdUseCase } from 'src/application/use-cases/user/get-user-by-id.usecase';
import { UpdateUserStatusUseCase } from 'src/application/use-cases/user/update-user-status.usecase';
import { UserController } from 'src/presentation/user/controller/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      UserProfileOrmEntity,
      CompanyOrmEntity,
    ]),
    JwtAuthModule,
  ],
  controllers: [UserController],
  providers: [
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserStatusUseCase,
    { provide: 'IUserRepository', useClass: UserTypeormRepository },
    {
      provide: 'IUserProfileRepository',
      useClass: UserProfileTypeormRepository,
    },
    { provide: 'ICompanyRepository', useClass: CompanyTypeormRepository },
  ],
  exports: ['IUserRepository', 'IUserProfileRepository', 'ICompanyRepository'],
})
export class UsersModule {}
