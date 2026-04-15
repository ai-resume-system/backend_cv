import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
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
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, ERROR_CODES.AUTH_PASSWORD_WEAK)
  password: string;
}

export class RequestRegisterJobSeekerDto extends RequestRegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
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
  @MinLength(2)
  @MaxLength(200)
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

  @ApiProperty({
    example: '0.0.0.0',
  })
  @IsString()
  @IsNotEmpty()
  ip: string;
}

export class RequestLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RequestRefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class RequestChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
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

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
