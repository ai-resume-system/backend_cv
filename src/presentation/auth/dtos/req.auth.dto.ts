import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

export class RequestRegisterDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, ERROR_CODES.AUTH_PASSWORD_WEAK)
  password: string;
}

export class RequestRegisterJobSeekerDto extends RequestRegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  fullName: string;
}

export class RequestRegisterRecruiterDto extends RequestRegisterDto {
  @ApiProperty({ example: '0123456789' })
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

  @ApiProperty({ example: 'Tech Company' })
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @ApiProperty({ example: 'Hanoi' })
  @IsNotEmpty()
  @IsString()
  location: string;
}

export class RequestVerifyOtpDto {
  @ApiProperty({ example: 'admin@edumarket.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty({ example: Object.values(EOtpType).join(' | '), enum: EOtpType })
  @IsNotEmpty()
  @IsEnum(EOtpType)
  type: EOtpType;
}

export class RequestSendOtpDto {
  @ApiProperty({ example: 'admin@edumarket.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: Object.values(EOtpType).join(' | '), enum: EOtpType })
  @IsNotEmpty()
  @IsEnum(EOtpType)
  type: EOtpType;
}

export class RequestLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RequestRefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class RequestChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, ERROR_CODES.AUTH_PASSWORD_WEAK)
  newPassword: string;
}

export class RequestForgotPasswordDto {
  @ApiProperty({ example: 'admin@edumarket.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'abc-xyz-uuid' })
  @IsNotEmpty()
  @IsString()
  signKey: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, ERROR_CODES.AUTH_PASSWORD_WEAK)
  newPassword: string;
}
