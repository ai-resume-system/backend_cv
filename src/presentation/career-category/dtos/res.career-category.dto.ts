import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { ApiResponseDto, MetaDto } from 'src/common/dto/response.dto';
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

  @ApiPropertyOptional()
  deletedAt?: Date;
}

export class ResponseApiCareerCategoryDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseCareerCategoryDto })
  declare data: ResponseCareerCategoryDto;
}

export class ResponseListApiCareerCategoryDto extends ApiResponseDto<
  ResponseCareerCategoryDto[]
> {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: [ResponseCareerCategoryDto] })
  declare data: ResponseCareerCategoryDto[];
}
