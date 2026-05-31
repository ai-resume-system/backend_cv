import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserRole } from 'src/common/constants/enum/user.enum';

export interface IBaseRegisterDto {
  email: string;
  password: string;
  role: EUserRole;
}

export interface IRegisterJobSeekerDto extends IBaseRegisterDto {
  fullName: string;
}

export interface IRegisterRecruiterDto extends IBaseRegisterDto {
  phone?: string;
  name: string;
  address: string;
}

export interface IVerifyOtpDto {
  email: string;
  otp: string;
  type: EOtpType;
  role?: EUserRole;
}

export interface ISendOtpDto {
  email: string;
  type: EOtpType;
  role?: EUserRole;
}

export interface ILoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRefreshTokenDto {
  refreshToken: string;
}

export interface IChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface IForgotPasswordDto {
  email: string;
  signKey: string;
  newPassword: string;
  role: EUserRole;
}

export interface ILogoutDto {
  userId: string;
  accessToken?: string;
}
