import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetCompaniesDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Search by company name or address' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Address filter',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Career category ID filter',
  })
  @IsOptional()
  @IsUUID()
  careerCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Career category slug filter',
  })
  @IsOptional()
  @IsString()
  careerCategorySlug?: string;
}
