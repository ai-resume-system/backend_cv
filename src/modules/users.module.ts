import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleOrmEntity } from 'src/infrastructure/database/entities/role.orm-entity';
import { UserOrmEntity } from 'src/infrastructure/database/entities/user.orm-entity';
import { UserTypeormRepository } from 'src/infrastructure/database/repositories/user.typeorm-repository';
import { UsersController } from 'src/presentation/users/controller/users.controller';
import { RolesModule } from './roles.module';
import { CreateUserUseCase } from 'src/application/use-cases/user/create-user.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity]),
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    { provide: 'IUserRepository', useClass: UserTypeormRepository },
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}
