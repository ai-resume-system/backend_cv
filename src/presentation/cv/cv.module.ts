import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { GetCVByIdQuery } from 'src/application/queries/cv/get-cv-by-id.query';
import { GetCVDownloadUrlQuery } from 'src/application/queries/cv/get-cv-download-url.query';
import { GetCVPreviewUrlQuery } from 'src/application/queries/cv/get-cv-preview-url.query';
import { GetCVsQuery } from 'src/application/queries/cv/get-cvs.query';
import { CreateCVUseCase } from 'src/application/use-cases/cv/create-cv.usecase';
import { DeleteCVUseCase } from 'src/application/use-cases/cv/delete-cv.usecase';
import { UpdateCVUseCase } from 'src/application/use-cases/cv/update-cv.usecase';
import { SetDefaultCVUseCase } from 'src/application/use-cases/cv/set-default-cv.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { SearchModule } from 'src/infrastructure/elasticsearch/search.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { CVController } from 'src/presentation/cv/controller/cv.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CVOrmEntity]),
    JwtAuthModule,
    RedisModule,
    StorageModule,
    SearchModule,
  ],
  controllers: [CVController],
  providers: [
    GetCVsQuery,
    // GetCVByIdQuery,
    GetCVDownloadUrlQuery,
    GetCVPreviewUrlQuery,
    CreateCVUseCase,
    UpdateCVUseCase,
    DeleteCVUseCase,
    SetDefaultCVUseCase,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
  ],
  exports: ['ICVRepository'],
})
export class CVModule {}
