import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFileUseCase } from 'src/application/use-cases/upload/upload-file.usecase';
import { JwtAuthModule } from 'src/common/guards/jwt-auth.module';
import { CVOrmEntity } from 'src/infrastructure/database/entities/cv.orm-entity';
import { CVTypeormRepository } from 'src/infrastructure/database/repositories/cv.typeorm-repository';
import { QueueModule } from 'src/infrastructure/queue/queue.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { UsersModule } from 'src/presentation/user/users.module';
import { UploadController } from './controller/upload.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CVOrmEntity]),
    JwtAuthModule,
    RedisModule,
    StorageModule,
    QueueModule,
    UsersModule,
  ],
  controllers: [UploadController],
  providers: [
    UploadFileUseCase,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
  ],
})
export class UploadModule {}
