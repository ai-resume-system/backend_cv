import { ApiProperty } from '@nestjs/swagger';
import {
  EBucketType,
  EUploadType,
} from 'src/common/constants/enum/upload.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseUploadFileDto {
  @ApiProperty({
    enum: Object.values(EUploadType),
    example: Object.values(EUploadType).join(' | '),
  })
  type: EUploadType;

  @ApiProperty({
    enum: Object.values(EBucketType),
    example: Object.values(EBucketType).join(' | '),
  })
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

export class ResponseApiUploadFileDto extends ApiResponseDto<ResponseUploadFileDto> {
  @ApiProperty({ type: ResponseUploadFileDto })
  declare data: ResponseUploadFileDto;
}
