import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetCareerCategoriesDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Search by name, slug' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Column to sort' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class RequestCreateCareerCategoryDto {
  @ApiProperty({ example: 'IT' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'it' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Information Technology', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RequestUpdateCareerCategoryDto {
  @ApiProperty({ example: 'IT', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'it', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Information Technology', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: Object.values(ECareerCategoriesStatus).join(' | '),
    enum: ECareerCategoriesStatus,
  })
  @IsEnum(ECareerCategoriesStatus)
  @IsOptional()
  status?: ECareerCategoriesStatus;
}
