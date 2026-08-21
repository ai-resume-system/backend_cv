import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponsePublicCareerCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
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
  jobCount?: number;
}

export class ResponseApiPublicCareerCategoryDto extends ApiResponseDto<ResponsePublicCareerCategoryDto> {
  @ApiProperty({ type: ResponsePublicCareerCategoryDto })
  declare data: ResponsePublicCareerCategoryDto;
}

export class ResponseListApiPublicCareerCategoryDto extends ApiResponseDto<
  ResponsePublicCareerCategoryDto[]
> {
  @ApiProperty({ type: [ResponsePublicCareerCategoryDto] })
  declare data: ResponsePublicCareerCategoryDto[];
}
