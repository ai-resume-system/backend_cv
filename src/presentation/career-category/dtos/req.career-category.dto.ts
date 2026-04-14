import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

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

export class RequestUpdateCareerCategoryDto {
  @ApiProperty({ example: 'IT', required: false })
  @IsOptional()
  @IsString()
  name?: string;

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
