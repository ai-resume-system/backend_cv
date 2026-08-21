import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCVByIdQuery } from 'src/application/queries/cv/get-cv-by-id.query';
import { GetCVDownloadUrlQuery } from 'src/application/queries/cv/get-cv-download-url.query';
import { GetCVPreviewUrlQuery } from 'src/application/queries/cv/get-cv-preview-url.query';
import { GetCVsQuery } from 'src/application/queries/cv/get-cvs.query';
import { CreateCVUseCase } from 'src/application/use-cases/cv/create-cv.usecase';
import { DeleteCVUseCase } from 'src/application/use-cases/cv/delete-cv.usecase';
import { UpdateCVUseCase } from 'src/application/use-cases/cv/update-cv.usecase';
import { SetDefaultCVUseCase } from 'src/application/use-cases/cv/set-default-cv.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CVParsedDataOrmEntity } from 'src/infrastructure/database/entities/cv-parsed-data.orm-entity';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { JobApplicationOrmEntity } from 'src/infrastructure/database/entities/job-application.orm-entity';
import { CVParsedDataTypeormRepository } from 'src/infrastructure/database/repositories/cv-parsed-data.typeorm-repository';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { JobApplicationTypeormRepository } from 'src/infrastructure/database/repositories/job-application.typeorm-repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { CVController } from 'src/presentation/cv/controller/cv.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CVOrmEntity,
      CVParsedDataOrmEntity,
      JobApplicationOrmEntity,
    ]),
    JwtAuthModule,
    RedisModule,
    StorageModule,
  ],
  controllers: [CVController],
  providers: [
    GetCVsQuery,
    GetCVByIdQuery,
    GetCVDownloadUrlQuery,
    GetCVPreviewUrlQuery,
    CreateCVUseCase,
    UpdateCVUseCase,
    DeleteCVUseCase,
    SetDefaultCVUseCase,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
    {
      provide: 'ICVParsedDataRepository',
      useClass: CVParsedDataTypeormRepository,
    },
    {
      provide: 'IJobApplicationRepository',
      useClass: JobApplicationTypeormRepository,
    },
  ],
  exports: ['ICVRepository'],
})
export class CVModule {}
