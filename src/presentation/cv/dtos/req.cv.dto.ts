import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ECVStatus } from 'src/common/constants/enum/cv.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetCVsDto extends RequestPaginationDto {
  @ApiPropertyOptional({
    description: 'Search CV by title',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Column to sort' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ enum: ECVStatus })
  @IsOptional()
  @IsEnum(ECVStatus)
  status?: ECVStatus;
}

export class RequestCreateCVDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional()
  @IsString()
  fileExtension: 'pdf' | 'docx' | 'doc';
}

export class RequestUpdateCVDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}

export class RequestUpdateDefaultCVDto {
  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isDefault: boolean;
}
