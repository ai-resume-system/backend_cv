import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IMyProfileResponseDto,
  IResponseMyCompanyDto,
  IResponseMyProfileDto,
} from 'src/application/dtos/account/res.account.dto';
import { GetMyProfileQuery } from 'src/application/queries/account/get-my-profile.query';
import { UpdateMyProfileUseCase } from 'src/application/use-cases/account/update-my-profile.usecase';
import { UpdateMyCompanyUseCase } from 'src/application/use-cases/account/update-my-company.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/account/change-password.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestUpdateMyProfileDto,
  RequestUpdateMyCompanyDto,
  RequestChangePasswordDto,
} from '../dtos/req.account.dto';
import {
  ResponseApiCompanyDto,
  ResponseApiMyProfileDto,
  ResponseApiProfileDto,
} from '../dtos/res.account.dto';
import { EUserRole } from 'src/common/constants/enum/user.enum';

@Controller({ path: 'account', version: '1' })
@ApiTags('Account')
export class AccountController extends BaseController {
  constructor(
    private readonly getMyProfileQuery: GetMyProfileQuery,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly updateMyCompanyUseCase: UpdateMyCompanyUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {
    super(new Logger(AccountController.name));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Get my profile successfully',
    type: ResponseApiMyProfileDto,
  })
  async getMyProfile(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<IMyProfileResponseDto> {
    return await this.getMyProfileQuery.execute(user.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update my profile (job seeker only)' })
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ResponseApiProfileDto,
  })
  async updateMyProfile(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestUpdateMyProfileDto,
  ): Promise<IResponseMyProfileDto> {
    return await this.updateMyProfileUseCase.execute(user.id, dto);
  }

  @Patch('me/company')
  @ApiOperation({ summary: 'Update my company (recruiter only)' })
  @AuthRequired(EUserRole.RECRUITER)
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: ResponseApiCompanyDto,
  })
  async updateMyCompany(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestUpdateMyCompanyDto,
  ): Promise<IResponseMyCompanyDto> {
    return await this.updateMyCompanyUseCase.execute(user.id, dto);
  }

  @Patch('me/change-password')
  @ApiOperation({ summary: 'Change password' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ResponseApiNullDto,
  })
  async changePassword(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.changePasswordUseCase.execute(user.id, dto);
  }
}
