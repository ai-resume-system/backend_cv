import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IPublicAuthResponseDto,
  IResponseAuthDto,
} from 'src/application/dtos/auth/res.auth.dto';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { RegisterUseCase } from 'src/application/use-cases/auth/register.usecase';
import { SendOtpUseCase } from 'src/application/use-cases/auth/send-otp.usecase';
import { VerifyOtpUseCase } from 'src/application/use-cases/auth/verify-otp.usecase';
import { ForgotPasswordUseCase } from 'src/application/use-cases/auth/forgot-password.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import {
  RequestLoginDto,
  RequestRefreshTokenDto,
  RequestRegisterJobSeekerDto,
  RequestRegisterRecruiterDto,
  RequestSendOtpDto,
  RequestVerifyOtpDto,
  RequestForgotPasswordDto,
} from 'src/presentation/auth/dtos/req.auth.dto';
import {
  ResponseApiAuthDto,
  ResponseApiVerifyOtpDto,
} from '../dtos/res.auth.dto';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from 'src/common/utils/cookie.utils';
import { resolveAuthClient } from 'src/common/utils/auth-client.utils';
import { AUTH_CLIENT_COOKIE_NAMES } from 'src/common/constants/auth-client.constants';

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

  private toPublicAuthResponse(
    payload: IResponseAuthDto,
  ): IPublicAuthResponseDto {
    return {
      accessToken: payload.accessToken,
      expiresIn: payload.expiresIn,
      expiresAt: payload.expiresAt,
    };
  }

  @Post('register/job-seeker')
  @ApiOperation({
    summary: 'Register a new job seeker account. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'Register successfully',
    type: ResponseApiNullDto,
  })
  async registerJobSeeker(
    @Body() dto: RequestRegisterJobSeekerDto,
  ): Promise<IResponseApiNullDto> {
    return await this.registerUseCase.execute({
      ...dto,
      role: EUserRole.JOB_SEEKER,
    });
  }

  @Post('register/recruiter')
  @ApiOperation({
    summary: 'Register a new recruiter account. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'Register successfully',
    type: ResponseApiNullDto,
  })
  async registerRecruiter(
    @Body() dto: RequestRegisterRecruiterDto,
  ): Promise<IResponseApiNullDto> {
    return await this.registerUseCase.execute({
      ...dto,
      role: EUserRole.RECRUITER,
    });
  }

  @Post('send-otp')
  @ApiOperation({
    summary:
      'Send OTP to email for register or forgot-password flow. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully',
    type: ResponseApiNullDto,
  })
  async sendOtp(
    @Body() dto: RequestSendOtpDto,
    @Req() req: Request,
  ): Promise<IResponseApiNullDto> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    return await this.sendOtpUseCase.execute(dto, ip!);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary:
      'Verify OTP code for register or forgot-password flow. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'OTP verified successfully',
    type: ResponseApiVerifyOtpDto,
  })
  async verifyOtp(
    @Body() dto: RequestVerifyOtpDto,
  ): Promise<IResponseApiNullDto | { data: { signKey: string } }> {
    return await this.verifyOtpUseCase.execute(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successfully',
    type: ResponseApiAuthDto,
  })
  async login(
    @Body() dto: RequestLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IPublicAuthResponseDto> {
    const authClient = resolveAuthClient(req);
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    const result = await this.loginUseCase.execute(dto, ip!);

    const cookieMaxAge = dto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;
    setRefreshTokenCookie(res, authClient, result.refreshToken, cookieMaxAge);

    return this.toPublicAuthResponse(result);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary:
      'Refresh access token by refresh token or auth cookie. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'Refresh token successfully',
    type: ResponseApiAuthDto,
  })
  async refreshToken(
    @Req() req: Request,
    @Body() dto: RequestRefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IPublicAuthResponseDto> {
    const authClient = resolveAuthClient(req);
    const refreshToken =
      req.cookies?.[AUTH_CLIENT_COOKIE_NAMES[authClient]] ?? dto.refreshToken;

    if (!refreshToken) {
      throw new AppException(ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED);
    }

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    setRefreshTokenCookie(res, authClient, result.refreshToken);

    return this.toPublicAuthResponse(result);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Reset password with verified email OTP signKey. Access: Public.',
  })
  @ApiResponse({
    status: 201,
    description: 'Password reset successfully',
    type: ResponseApiNullDto,
  })
  async forgotPassword(
    @Body() dto: RequestForgotPasswordDto,
  ): Promise<IResponseApiNullDto> {
    return await this.forgotPasswordUseCase.execute(dto);
  }

  @Post('logout')
  @ApiOperation({
    summary:
      'Logout current account and clear refresh cookie. Access: Authenticated User.',
  })
  @AuthRequired()
  @ApiResponse({
    status: 201,
    description: 'Logout successfully',
    type: ResponseApiNullDto,
  })
  async logout(
    @AuthCurrentUser() user: ICurrentUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IResponseApiNullDto> {
    const authHeader = req.headers['authorization'] as string;
    const accessToken = authHeader?.replace('Bearer ', '');
    clearRefreshTokenCookie(res, resolveAuthClient(req));
    return await this.logoutUseCase.execute({
      userId: user.id,
      accessToken,
    });
  }
}
