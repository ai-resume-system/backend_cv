import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseUserListProfileDto {
  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}

export class ResponseUserListCompanyDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;
}

export class ResponseUserListDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({
    enum: EUserStatus,
    example: Object.values(EUserStatus).join(' | '),
  })
  status: EUserStatus;

  @ApiProperty({
    enum: EUserRole,
    example: Object.values(EUserRole).join(' | '),
  })
  role: EUserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: ResponseUserListProfileDto })
  profile?: ResponseUserListProfileDto;

  @ApiPropertyOptional({ type: ResponseUserListCompanyDto })
  company?: ResponseUserListCompanyDto;
}

export class ResponseUserDetailProfileDto {
  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  bio?: string;
}

export class ResponseUserDetailCompanyDto {
  @ApiPropertyOptional()
  careerCategoryId?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  taxCode?: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  bannerUrl?: string | null;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  websiteUrl?: string;

  @ApiPropertyOptional()
  employeeMin?: number;

  @ApiPropertyOptional()
  employeeMax?: number;
}

export class ResponseUserDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({
    enum: EUserStatus,
    example: Object.values(EUserStatus).join(' | '),
  })
  status: EUserStatus;

  @ApiProperty({
    enum: EUserRole,
    example: Object.values(EUserRole).join(' | '),
  })
  role: EUserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: ResponseUserDetailProfileDto })
  profile?: ResponseUserDetailProfileDto;

  @ApiPropertyOptional({ type: ResponseUserDetailCompanyDto })
  company?: ResponseUserDetailCompanyDto;
}

export class ResponseApiUserDetailDto extends ApiResponseDto<ResponseUserDetailDto> {
  @ApiProperty({ type: ResponseUserDetailDto })
  declare data: ResponseUserDetailDto;
}

export class ResponseListApiUserDto extends ApiResponseDto<ResponseUserListDto[]> {
  @ApiProperty({ type: [ResponseUserListDto] })
  declare data: ResponseUserListDto[];
}
