import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
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
  @IsOptional()
  @IsString()
  file?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class RequestUpdateCVDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    enum: ECVStatus,
    example: Object.values(ECVStatus).join(' | '),
  })
  @IsOptional()
  @IsEnum(ECVStatus)
  status?: ECVStatus;
}
