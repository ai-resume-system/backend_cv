import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseSkillDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  careerCategoryId?: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date | null;
}

export class ResponseSkillTreeDto extends ResponseSkillDto {
  @ApiProperty({ type: [ResponseSkillDto] })
  children: ResponseSkillDto[];
}

export class ResponseApiSkillDto extends ApiResponseDto<ResponseSkillDto> {
  @ApiProperty({ type: ResponseSkillDto })
  declare data: ResponseSkillDto;
}

export class ResponseListApiSkillDto extends ApiResponseDto<
  ResponseSkillTreeDto[]
> {
  @ApiProperty({ type: [ResponseSkillTreeDto] })
  declare data: ResponseSkillTreeDto[];
}
