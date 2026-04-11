import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { RegisterUseCase } from 'src/application/use-cases/auth/register.usecase';
import { VerifyOtpUseCase } from 'src/application/use-cases/auth/verify-otp.usecase';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/auth/change-password.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { GetProfileUseCase } from 'src/application/use-cases/auth/get-profile.usecase';
import { JwtAuthGuard } from 'src/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from 'src/infrastructure/auth/current-user.guard';
import { Public } from 'src/infrastructure/auth/public.decorator';
import {
  RegisterDto,
  RegisterRecruiterDto,
  VerifyOtpDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from 'src/presentation/auth/dtos/req.auth.dto';
import { EUserRole } from 'src/common/constants/enum/user.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Public()
  @Post('register/job-seeker')
  registerJobSeeker(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute({
      ...dto,
      role: EUserRole.JOB_SEEKER,
    });
  }

  @Public()
  @Post('register/recruiter')
  registerRecruiter(@Body() dto: RegisterRecruiterDto) {
    return this.registerUseCase.execute({
      ...dto,
      role: EUserRole.RECRUITER,
    });
  }

  @Public()
  @Post('verify-otp')
  verify(@Body() dto: VerifyOtpDto) {
    return this.verifyOtpUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @CurrentUser() user: { sub: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  logout(@CurrentUser() user: { sub: string }) {
    return this.logoutUseCase.execute(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: { sub: string }) {
    return this.getProfileUseCase.execute(user.sub);
  }
}
