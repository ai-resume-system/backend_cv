import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ECVStatus,
  EProcessingStatus,
} from 'src/common/constants/enum/cv.enum';
import { MetaDto, PaginationDto } from 'src/common/dto/response.dto';

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

export class ResponseApiCVDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseCVDto })
  data: ResponseCVDto;
}

export class ResponseListApiCVDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: [ResponseCVDto] })
  data: ResponseCVDto[];

  @ApiProperty({ type: PaginationDto })
  pagination?: PaginationDto;
}

export class ResponseCVDownloadDto {
  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  expiresIn: number;
}

export class ResponseApiCVDownloadDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseCVDownloadDto })
  data: ResponseCVDownloadDto;
}

export class ResponseCVPreviewDto {
  @ApiProperty()
  previewUrl: string;

  @ApiProperty()
  expiresIn: number;
}

export class ResponseApiCVPreviewDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseCVPreviewDto })
  data: ResponseCVPreviewDto;
}
