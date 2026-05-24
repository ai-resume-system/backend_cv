import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ECVStatus,
  EProcessingStatus,
} from 'src/common/constants/enum/cv.enum';
import { ApiResponseDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseCVDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  fileExtension?: string;

  @ApiPropertyOptional({
    enum: EProcessingStatus,
    example: Object.values(EProcessingStatus).join(' | '),
  })
  processingStatus?: EProcessingStatus;

  @ApiPropertyOptional()
  isDefault?: boolean;

  @ApiPropertyOptional()
  summary?: string;

  @ApiProperty({
    enum: ECVStatus,
    example: Object.values(ECVStatus).join(' | '),
  })
  status: ECVStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ResponseApiCVDto extends ApiResponseDto<ResponseCVDto> {
  @ApiProperty({ type: ResponseCVDto })
  declare data: ResponseCVDto;
}

export class ResponseListApiCVDto extends ApiResponseDto<ResponseCVDto[]> {
  @ApiProperty({ type: [ResponseCVDto] })
  declare data: ResponseCVDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}

export class ResponseCVDownloadDto {
  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  expiresIn: number;
}

export class ResponseApiCVDownloadDto extends ApiResponseDto<ResponseCVDownloadDto> {
  @ApiProperty({ type: ResponseCVDownloadDto })
  declare data: ResponseCVDownloadDto;
}

export class ResponseCVPreviewDto {
  @ApiProperty()
  previewUrl: string;

  @ApiProperty()
  expiresIn: number;
}

export class ResponseApiCVPreviewDto extends ApiResponseDto<ResponseCVPreviewDto> {
  @ApiProperty({ type: ResponseCVPreviewDto })
  declare data: ResponseCVPreviewDto;
}
