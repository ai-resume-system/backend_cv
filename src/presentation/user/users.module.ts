import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { UserProfileOrmEntity } from 'src/infrastructure/database/entities/user_profile.orm-entity';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { UserProfileTypeormRepository } from 'src/infrastructure/database/repositories/user-profile.typeorm-repository';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { GetUserByIdQuery } from 'src/application/queries/user/get-user-by-id.query';
import { GetUsersQuery } from 'src/application/queries/user/get-users.query';
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
    GetUsersQuery,
    GetUserByIdQuery,
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
