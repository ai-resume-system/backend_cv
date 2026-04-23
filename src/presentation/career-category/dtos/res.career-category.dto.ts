import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';

export class ResponseCareerCategoryDto implements ICareerCategoryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

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
  deletedAt: Date;
}

export class ResponseApiCareerCategoryDto {
  @ApiProperty({ type: ResponseCareerCategoryDto })
  data: ResponseCareerCategoryDto;
}

export class ResponseListApiCareerCategoryDto extends ApiResponseDto<
  ResponseCareerCategoryDto[]
> {
  @ApiProperty({ type: [ResponseCareerCategoryDto] })
  declare data: ResponseCareerCategoryDto[];
}
