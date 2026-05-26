import { ApiProperty } from '@nestjs/swagger';
import { ResponseJobCareerCategoryDto, ResponseJobCompanyDto } from 'src/presentation/job/dtos/res.job.dto';
import { ApiResponseDto, PaginationDto } from 'src/common/dto/response.dto';

export class ResponseFavouriteJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  shortDescription?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  salaryMin?: number;

  @ApiProperty({ required: false })
  salaryMax?: number;

  @ApiProperty({ required: false })
  experienceYears?: number;

  @ApiProperty({ required: false })
  expiredAt?: Date;

  @ApiProperty({ type: ResponseJobCompanyDto })
  company: ResponseJobCompanyDto;

  @ApiProperty({ required: false, type: ResponseJobCareerCategoryDto })
  careerCategory?: ResponseJobCareerCategoryDto;

  @ApiProperty()
  isFavourited: boolean;
}

export class ResponseFavouriteJobMessageDto {
  @ApiProperty()
  message: string;
}

export class ResponseApiFavouriteJobDto extends ApiResponseDto<ResponseFavouriteJobMessageDto> {
  @ApiProperty({ type: ResponseFavouriteJobMessageDto })
  declare data: ResponseFavouriteJobMessageDto;
}

export class ResponseListApiFavouriteJobDto extends ApiResponseDto<ResponseFavouriteJobDto[]> {
  @ApiProperty({ type: [ResponseFavouriteJobDto] })
  declare data: ResponseFavouriteJobDto[];

  @ApiProperty({ type: PaginationDto })
  declare pagination?: PaginationDto;
}
