import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

export class RequestUpdateProfileBaseDto {
  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84)(3|5|7|8|9)[0-9]{8}$/, ERROR_CODES.AUTH_PHONE_INVALID)
  @Transform(({ value }) => {
    if (!value) return value;
    let phone = value.replace(/\s+/g, '');
    if (phone.startsWith('0')) {
      phone = '+84' + phone.slice(1);
    }
    return phone;
  })
  phone?: string;
}

export class RequestUpdateMyProfileDto extends RequestUpdateProfileBaseDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Experienced developer...' })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class RequestUpdateMyCompanyDto extends RequestUpdateProfileBaseDto {
  @ApiPropertyOptional({ example: 'uuid-of-career-category' })
  @IsOptional()
  @IsString()
  careerCategoryId?: string;

  @ApiPropertyOptional({ example: 'Tech Company' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Hanoi' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 10.802192 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.677087 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://company.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeeMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeeMax?: number;
}

export class RequestChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
