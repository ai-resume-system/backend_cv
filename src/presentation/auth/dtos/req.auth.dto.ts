import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

export class RegisterDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterRecruiterDto extends RegisterDto {
  @ApiProperty({ example: '0123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84)(3|5|7|8|9)[0-9]{8}$/, ERROR_CODES.AUTH_PHONE_INVALID)
  @Transform(({ value }) => {
    if (!value) return value;
    // Remove spaces
    let phone = value.replace(/\s+/g, '');
    // Convert 0 -> +84
    if (phone.startsWith('0')) {
      phone = '+84' + phone.slice(1);
    }
    return phone;
  })
  phone?: string;

  // @ApiProperty({ example: 'Nguyen Van B' })
  // @IsString()
  // @MinLength(2)
  // @MaxLength(100)
  // fullName: string;

  // @ApiProperty({ example: 'Tech Company' })
  // @IsString()
  // @MinLength(2)
  // @MaxLength(200)
  // companyName: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'admin@edumarket.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@edumarket.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
