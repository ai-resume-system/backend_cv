import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseCompanyCareerCategoryDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  slug?: string;
}

export class ResponseCompanyDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  bannerUrl?: string | null;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  websiteUrl?: string;

  @ApiPropertyOptional()
  taxCode?: string;

  @ApiPropertyOptional({ type: ResponseCompanyCareerCategoryDto })
  careerCategory?: ResponseCompanyCareerCategoryDto;

  @ApiProperty()
  openJobCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ResponseApiCompanyDto extends ApiResponseDto<ResponseCompanyDto> {
  @ApiProperty({ type: ResponseCompanyDto })
  declare data: ResponseCompanyDto;
}

export class ResponseListApiCompanyDto extends ApiResponseDto<
  ResponseCompanyDto[]
> {
  @ApiProperty({ type: [ResponseCompanyDto] })
  declare data: ResponseCompanyDto[];
}
