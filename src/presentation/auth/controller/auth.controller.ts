import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { RegisterUseCase } from 'src/application/use-cases/auth/register.usecase';
import { SendOtpUseCase } from 'src/application/use-cases/auth/send-otp.usecase';
import { VerifyOtpUseCase } from 'src/application/use-cases/auth/verify-otp.usecase';
import { ForgotPasswordUseCase } from 'src/application/use-cases/auth/forgot-password.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import {
  RequestLoginDto,
  RequestRefreshTokenDto,
  RequestRegisterJobSeekerDto,
  RequestRegisterRecruiterDto,
  RequestSendOtpDto,
  RequestVerifyOtpDto,
  RequestForgotPasswordDto,
} from 'src/presentation/auth/dtos/req.auth.dto';
import { ResponseAuthDto } from '../dtos/res.auth.dto';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('Auth')
export class AuthController extends BaseController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly sendOtpUseCase: SendOtpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {
    super(new Logger(AuthController.name));
  }

  @Post('register/job-seeker')
  @ApiOperation({ summary: 'Register account with role job seeker' })
  @ApiResponse({
    status: 201,
    description: 'Register successfully',
  })
  async registerJobSeeker(
    @Body() dto: RequestRegisterJobSeekerDto,
  ): Promise<{ message: string }> {
    return await this.registerUseCase.execute({
      ...dto,
      role: EUserRole.JOB_SEEKER,
    });
  }

  @Post('register/recruiter')
  @ApiOperation({ summary: 'Register account with role recruiter' })
  @ApiResponse({
    status: 201,
    description: 'Register successfully',
  })
  async registerRecruiter(
    @Body() dto: RequestRegisterRecruiterDto,
  ): Promise<{ message: string }> {
    return await this.registerUseCase.execute({
      ...dto,
      role: EUserRole.RECRUITER,
    });
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to email (register/forgot password)' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  async sendOtp(
    @Body() dto: RequestSendOtpDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    console.log('ip', ip);
    return await this.sendOtpUseCase.execute(dto, ip!);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  async verifyOtp(
    @Body() dto: RequestVerifyOtpDto,
  ): Promise<{ signKey?: string; message: string }> {
    return await this.verifyOtpUseCase.execute(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    type: ResponseAuthDto,
  })
  async login(
    @Body() dto: RequestLoginDto,
    @Req() req: Request,
  ): Promise<IResponseAuthDto> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    const result = await this.loginUseCase.execute(dto, ip!);
    return result;
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 201,
    description: 'Refresh token successfully',
    type: ResponseAuthDto,
  })
  async refreshToken(
    @Body() dto: RequestRefreshTokenDto,
  ): Promise<IResponseAuthDto> {
    const result = await this.refreshTokenUseCase.execute(dto);
    return result;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Reset password with email OTP signKey' })
  @ApiResponse({ status: 201, description: 'Password reset successfully' })
  async forgotPassword(
    @Body() dto: RequestForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout account' })
  @AuthRequired()
  async logout(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<{ message: string }> {
    return await this.logoutUseCase.execute({ userId: user.id });
  }
}
