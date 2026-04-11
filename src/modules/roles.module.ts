import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleOrmEntity } from 'src/infrastructure/database/entities/role.orm-entity';
import { RoleTypeormRepository } from 'src/infrastructure/database/repositories/role.typeorm-repository';
import { RolesController } from 'src/presentation/roles/controller/roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoleOrmEntity])],
  controllers: [RolesController],
  providers: [{ provide: 'IRoleRepository', useClass: RoleTypeormRepository }],
  exports: ['IRoleRepository'],
})
export class RolesModule {}
