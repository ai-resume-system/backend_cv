import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { UserProfileOrmEntity } from 'src/infrastructure/database/entities/user_profile.orm-entity';
import { CompanyOrmEntity } from 'src/infrastructure/database/entities/company.orm-entity';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { UserProfileTypeormRepository } from 'src/infrastructure/database/repositories/user-profile.typeorm-repository';
import { CompanyTypeormRepository } from 'src/infrastructure/database/repositories/company.typeorm-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      UserProfileOrmEntity,
      CompanyOrmEntity,
    ]),
  ],
  providers: [
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
