import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EUploadType } from 'src/common/constants/enum/upload.enum';

export class RequestUploadFileDto {
  @ApiProperty({
    enum: EUploadType,
    example: EUploadType.AVATAR,
  })
  @IsEnum(EUploadType)
  type: EUploadType;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
