import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';

//Response base
export class ResponseBaseProfileDto {
  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;
}

//Response for Job Seeker
export class ResponseProfileDto extends ResponseBaseProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Experienced developer...' })
  @IsOptional()
  @IsString()
  bio?: string;
}

//Response for Recruiter
export class ResponseCompanyDto extends ResponseBaseProfileDto {
  @ApiPropertyOptional({ example: 'uuid-of-career-category' })
  @IsOptional()
  @IsString()
  careerCategoriesId?: string;

  @ApiPropertyOptional({ example: 'Tech Company' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'Hanoi' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Leading tech company...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://company.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;
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

export class ResponseApiProfileDto extends ApiResponseDto<ResponseProfileDto> {
  @ApiProperty({ type: ResponseProfileDto })
  declare data: ResponseProfileDto;
}

export class ResponseApiCompanyDto extends ApiResponseDto<ResponseCompanyDto> {
  @ApiProperty({ type: ResponseCompanyDto })
  declare data: ResponseCompanyDto;
}
