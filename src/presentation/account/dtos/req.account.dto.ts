import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
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
  careerCategoriesId?: string;

  @ApiPropertyOptional({ example: 'Tech Company' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  taxCode?: string;

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
