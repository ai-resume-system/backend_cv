import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupSoftDeletedCvsUseCase } from 'src/application/use-cases/cv/cleanup-soft-deleted-cvs.usecase';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { JobMatchOrmEntity } from 'src/infrastructure/database/entities/job-match.orm-entity';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { JobMatchTypeormRepository } from 'src/infrastructure/database/repositories/job-match.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { CVCleanupScheduler } from './cv-cleanup.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([CVOrmEntity, JobMatchOrmEntity]),
    RedisModule,
  ],
  providers: [
    CVCleanupScheduler,
    CleanupSoftDeletedCvsUseCase,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
    { provide: 'IJobMatchRepository', useClass: JobMatchTypeormRepository },
  ],
})
export class DatabaseCleanupModule {}
