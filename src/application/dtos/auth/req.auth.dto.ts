import { EUserRole } from 'src/common/constants/enum/user.enum';

export class RegisterDto {
  email: string;
  password: string;
  role: EUserRole;
}

export class RegisterJobSeekerDto {
  email: string;
  password: string;
  phone?: string;
  fullName: string;
}

export class RegisterRecruiterDto {
  email: string;
  password: string;
  phone?: string;
  fullName: string;
  companyName: string;
}

export class VerifyOtpDto {
  email: string;
  otp: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
