import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMyProfileUseCase } from 'src/application/use-cases/account/get-my-profile.usecase';
import { UpdateMyProfileUseCase } from 'src/application/use-cases/account/update-my-profile.usecase';
import { UpdateMyCompanyUseCase } from 'src/application/use-cases/account/update-my-company.usecase';
import { ChangePasswordUseCase } from 'src/application/use-cases/account/change-password.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestUpdateMyProfileDto,
  RequestUpdateMyCompanyDto,
  RequestChangePasswordDto,
} from '../dtos/req.account.dto';
import {
  ResponseCompanyDto,
  ResponseMyProfileDto,
  ResponseProfileDto,
} from '../dtos/res.account.dto';

@Controller({ path: 'account', version: '1' })
@ApiTags('Account')
export class AccountController extends BaseController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
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
    type: ResponseMyProfileDto,
  })
  async getMyProfile(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<ResponseMyProfileDto> {
    return await this.getMyProfileUseCase.execute(user.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update my profile (job seeker only)' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ResponseProfileDto,
  })
  async updateMyProfile(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestUpdateMyProfileDto,
  ): Promise<ResponseProfileDto> {
    return await this.updateMyProfileUseCase.execute(user.id, dto);
  }

  @Patch('me/company')
  @ApiOperation({ summary: 'Update my company (recruiter only)' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: ResponseCompanyDto,
  })
  async updateMyCompany(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestUpdateMyCompanyDto,
  ): Promise<ResponseCompanyDto> {
    return await this.updateMyCompanyUseCase.execute(user.id, dto);
  }

  @Patch('me/change-password')
  @ApiOperation({ summary: 'Change password' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  async changePassword(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestChangePasswordDto,
  ) {
    return await this.changePasswordUseCase.execute(user.id, dto);
  }
}
