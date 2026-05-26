import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseSkillDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  careerCategoryId?: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ResponseApiSkillDto extends ApiResponseDto<ResponseSkillDto> {
  @ApiProperty({ type: ResponseSkillDto })
  declare data: ResponseSkillDto;
}

export class ResponseListApiSkillDto extends ApiResponseDto<
  ResponseSkillDto[]
> {
  @ApiProperty({ type: [ResponseSkillDto] })
  declare data: ResponseSkillDto[];
}
