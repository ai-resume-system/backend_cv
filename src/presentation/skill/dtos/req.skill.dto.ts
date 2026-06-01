import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetSkillsDto extends RequestPaginationDto {
  @ApiPropertyOptional({ description: 'Search by skill name' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Column to sort' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  careerCategoryId?: string;
}

export class RequestCreateSkillDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsUUID()
  careerCategoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class RequestUpdateSkillDto extends PartialType(RequestCreateSkillDto) {
  @ApiPropertyOptional({ example: 'React Native' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  override name?: string;
}
