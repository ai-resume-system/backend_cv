import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetSkillBySlugQuery } from 'src/application/queries/skill/get-skill-by-slug.query';
import { GetSkillsQuery } from 'src/application/queries/skill/get-skills.query';
import { CreateSkillUseCase } from 'src/application/use-cases/skill/create-skill.usecase';
import { DeleteSkillUseCase } from 'src/application/use-cases/skill/delete-skill.usecase';
import { UpdateSkillUseCase } from 'src/application/use-cases/skill/update-skill.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CareerCategoryOrmEntity } from 'src/infrastructure/database/entities/career-category.orm-entity';
import { CVSkillOrmEntity } from 'src/infrastructure/database/entities/cv-skill.orm-entity';
import { JobSkillOrmEntity } from 'src/infrastructure/database/entities/job-skill.orm-entity';
import { SkillOrmEntity } from 'src/infrastructure/database/entities/skill.orm-entity';
import { CareerCategoryTypeormRepository } from 'src/infrastructure/database/repositories/career-category.typeorm-repository';
import { CVSkillTypeormRepository } from 'src/infrastructure/database/repositories/cv-skill.typeorm-repository';
import { JobSkillTypeormRepository } from 'src/infrastructure/database/repositories/job-skill.typeorm-repository';
import { SkillTypeormRepository } from 'src/infrastructure/database/repositories/skill.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { SkillController } from './controller/skill.controller';
import { SkillAdminController } from './controller/skill-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SkillOrmEntity,
      CareerCategoryOrmEntity,
      CVSkillOrmEntity,
      JobSkillOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
  ],
  controllers: [SkillController, SkillAdminController],
  providers: [
    GetSkillsQuery,
    GetSkillBySlugQuery,
    CreateSkillUseCase,
    UpdateSkillUseCase,
    DeleteSkillUseCase,
    { provide: 'ISkillRepository', useClass: SkillTypeormRepository },
    {
      provide: 'ICareerCategoryRepository',
      useClass: CareerCategoryTypeormRepository,
    },
    { provide: 'IJobSkillRepository', useClass: JobSkillTypeormRepository },
    { provide: 'ICVSkillRepository', useClass: CVSkillTypeormRepository },
  ],
  exports: [
    'ISkillRepository',
    'IJobSkillRepository',
    'ICVSkillRepository',
    'ICareerCategoryRepository',
  ],
})
export class SkillModule {}
