import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseAdminCareerCategoryDto {
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
  deletedAt?: Date;

  @ApiPropertyOptional()
  jobCount?: number;
}

export class ResponseApiAdminCareerCategoryDto extends ApiResponseDto<ResponseAdminCareerCategoryDto> {
  @ApiProperty({ type: ResponseAdminCareerCategoryDto })
  declare data: ResponseAdminCareerCategoryDto;
}

export class ResponseListApiAdminCareerCategoryDto extends ApiResponseDto<
  ResponseAdminCareerCategoryDto[]
> {
  @ApiProperty({ type: [ResponseAdminCareerCategoryDto] })
  declare data: ResponseAdminCareerCategoryDto[];
}
