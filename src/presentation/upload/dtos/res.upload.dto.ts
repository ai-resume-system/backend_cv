import { ApiProperty } from '@nestjs/swagger';
import { EUploadType } from 'src/application/dtos/upload/req.upload.dto';
import { MetaDto } from 'src/common/dto/response.dto';
import { EBucketType } from 'src/infrastructure/storage/s3-storage.service';

export class ResponseUploadFileDto {
  @ApiProperty({ enum: EUploadType })
  type: EUploadType;

  @ApiProperty({ enum: EBucketType })
  bucketType: EBucketType;

  @ApiProperty()
  objectKey: string;

  @ApiProperty()
  previewUrl: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  fileExtension: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;
}

export class ResponseApiUploadFileDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseUploadFileDto })
  data: ResponseUploadFileDto;
}
