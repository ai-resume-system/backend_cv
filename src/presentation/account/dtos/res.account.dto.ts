import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';

//Response base
export class ResponseBaseProfileDto {
  @ApiPropertyOptional()
  phone?: string;
}

//Response UPDATE for Job Seeker
export class ResponseUpdateProfileDto extends ResponseBaseProfileDto {
  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  bio?: string;
}

//Response UPDATE for Recruiter
export class ResponseUpdateCompanyDto extends ResponseBaseProfileDto {
  @ApiPropertyOptional()
  careerCategoryId?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  taxCode?: string;

  @ApiPropertyOptional()
  websiteUrl?: string;

  @ApiPropertyOptional()
  employeeMin?: number;

  @ApiPropertyOptional()
  employeeMax?: number;
}

//Response GET for account
//Response for Job Seeker
export class ResponseProfileDto extends PartialType(
  OmitType(ResponseUpdateProfileDto, ['phone'] as const),
) {
  @ApiPropertyOptional()
  avatarUrl?: string;
}

//Response for Recruiter
export class ResponseCompanyDto extends PartialType(
  OmitType(ResponseUpdateCompanyDto, ['phone'] as const),
) {
  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  bannerUrl?: string;
}

//Response for account
export class ResponseMyProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  status: EUserStatus;

  @ApiProperty()
  role: EUserRole;

  @ApiPropertyOptional()
  profile?: ResponseProfileDto;

  @ApiPropertyOptional()
  company?: ResponseCompanyDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;
}

export class ResponseApiMyProfileDto extends ApiResponseDto<ResponseMyProfileDto> {
  @ApiProperty({ type: ResponseMyProfileDto })
  declare data: ResponseMyProfileDto;
}

export class ResponseApiUpdateProfileDto extends ApiResponseDto<ResponseUpdateProfileDto> {
  @ApiProperty({ type: ResponseUpdateProfileDto })
  declare data: ResponseUpdateProfileDto;
}

export class ResponseApiUpdateCompanyDto extends ApiResponseDto<ResponseUpdateCompanyDto> {
  @ApiProperty({ type: ResponseUpdateCompanyDto })
  declare data: ResponseUpdateCompanyDto;
}
