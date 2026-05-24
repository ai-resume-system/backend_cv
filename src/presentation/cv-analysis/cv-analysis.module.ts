import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCVAnalysisQuery } from 'src/application/queries/cv-analysis/get-cv-analysis.query';
import { AnalyzeCVUseCase } from 'src/application/use-cases/cv-analysis/analyze-cv.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CVParsedDataOrmEntity } from 'src/infrastructure/database/entities/cv-parsed-data.orm-entity';
import { CVSkillOrmEntity } from 'src/infrastructure/database/entities/cv-skill.orm-entity';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { SkillOrmEntity } from 'src/infrastructure/database/entities/skill.orm-entity';
import { CVParsedDataTypeormRepository } from 'src/infrastructure/database/repositories/cv-parsed-data.typeorm-repository';
import { CVSkillTypeormRepository } from 'src/infrastructure/database/repositories/cv-skill.typeorm-repository';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { SkillTypeormRepository } from 'src/infrastructure/database/repositories/skill.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { CVAnalysisController } from './controller/cv-analysis.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CVOrmEntity,
      CVParsedDataOrmEntity,
      CVSkillOrmEntity,
      SkillOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
  ],
  controllers: [CVAnalysisController],
  providers: [
    GetCVAnalysisQuery,
    AnalyzeCVUseCase,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
    {
      provide: 'ICVParsedDataRepository',
      useClass: CVParsedDataTypeormRepository,
    },
    { provide: 'ICVSkillRepository', useClass: CVSkillTypeormRepository },
    { provide: 'ISkillRepository', useClass: SkillTypeormRepository },
  ],
})
export class CVAnalysisModule {}
