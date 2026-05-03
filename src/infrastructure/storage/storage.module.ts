import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CvParserService } from './cv-parser.service';
import { FileValidationService } from './file-validation.service';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [S3StorageService, FileValidationService, CvParserService],
  exports: [S3StorageService, FileValidationService, CvParserService],
})
export class StorageModule {}
