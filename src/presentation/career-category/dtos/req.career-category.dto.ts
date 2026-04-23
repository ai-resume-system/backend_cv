import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetCareerCategoriesQueryDto extends RequestPaginationDto {
  @ApiPropertyOptional()
  @IsString()
  q?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsEnumFieldOptional({ ASC: 'asc', DESC: 'desc' } as const)
  sortOrder?: 'asc' | 'desc';

  @IsStringFieldOptional({
    description: 'Filter by id',
  })
  id?: string;
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
