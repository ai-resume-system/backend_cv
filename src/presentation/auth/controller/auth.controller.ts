import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangePasswordUseCase } from 'src/application/use-cases/auth/change-password.usecase';
import { GetProfileUseCase } from 'src/application/use-cases/auth/get-profile.usecase';
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
  RequestChangePasswordDto,
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
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {
    super(new Logger(AuthController.name));
  }

  @Post('register/job-seeker')
  @ApiOperation({ summary: 'Register account with role job seeker' })
  @ApiResponse({
    status: 201,
    description: 'Register successfully',
  })
  async registerJobSeeker(@Body() dto: RequestRegisterJobSeekerDto) {
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
  async registerRecruiter(@Body() dto: RequestRegisterRecruiterDto) {
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
  async sendOtp(@Body() dto: RequestSendOtpDto) {
    return await this.sendOtpUseCase.execute(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  async verifyOtp(@Body() dto: RequestVerifyOtpDto) {
    return await this.verifyOtpUseCase.execute(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    type: ResponseAuthDto,
  })
  async login(@Body() dto: RequestLoginDto) {
    return await this.loginUseCase.execute(dto);
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
    return await this.refreshTokenUseCase.execute(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Reset password with email OTP signKey' })
  @ApiResponse({ status: 201, description: 'Password reset successfully' })
  async forgotPassword(@Body() dto: RequestForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change password dont use OTP',
  })
  @AuthRequired()
  @ApiResponse({ status: 201, description: 'Password changed successfully' })
  async changePassword(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(user.id, dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout account' })
  @AuthRequired()
  async logout(@AuthCurrentUser() user: ICurrentUser) {
    return await this.logoutUseCase.execute(user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get profile account' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Get profile successfully',
  })
  async getProfile(@AuthCurrentUser() user: ICurrentUser) {
    return await this.getProfileUseCase.execute(user.id);
  }
}
