import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

export class ResponseCareerCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({
    example: Object.values(ECareerCategoriesStatus).join(' | '),
    enum: ECareerCategoriesStatus,
  })
  status: ECareerCategoriesStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deleteAt: Date;
}
