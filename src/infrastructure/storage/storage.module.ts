import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyOrmEntity } from '../database/entities/company.orm-entity';
import { CVOrmEntity } from '../database/entities/cv.orm-entity';
import { UserProfileOrmEntity } from '../database/entities/user_profile.orm-entity';
import { CvParserService } from './cv-parser.service';
import { FileValidationService } from './file-validation.service';
import { S3StorageService } from './s3-storage.service';
import { StorageCleanupService } from './storage-cleanup.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CVOrmEntity,
      UserProfileOrmEntity,
      CompanyOrmEntity,
    ]),
  ],
  providers: [
    S3StorageService,
    FileValidationService,
    CvParserService,
    StorageCleanupService,
  ],
  exports: [S3StorageService, FileValidationService, CvParserService],
})
export class StorageModule {}
