import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';
import { Type } from 'class-transformer';

export class RequestGetCareerCategoriesDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Search by name, slug' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Column to sort' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class RequestGetTopCareerCategoriesDto {
  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class RequestCreateCareerCategoryDto {
  @ApiProperty({ example: 'IT' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Information Technology', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RequestUpdateCareerCategoryDto extends PartialType(
  RequestCreateCareerCategoryDto,
) {
  @ApiProperty({
    example: Object.values(ECareerCategoriesStatus).join(' | '),
    enum: ECareerCategoriesStatus,
  })
  @IsEnum(ECareerCategoriesStatus)
  @IsOptional()
  status?: ECareerCategoriesStatus;
}
