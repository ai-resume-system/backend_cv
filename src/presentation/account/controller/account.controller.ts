import { Body, Controller, Delete, Get, Logger, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IMyProfileResponseDto,
  IResponseMyCompanyDto,
  IResponseMyProfileDto,
} from 'src/application/dtos/account/res.account.dto';
import { GetMyProfileQuery } from 'src/application/queries/account/get-my-profile.query';
import { ChangePasswordUseCase } from 'src/application/use-cases/account/change-password.usecase';
import { DeleteAvatarUseCase } from 'src/application/use-cases/account/delete-avatar.usecase';
import { DeleteCompanyBannerUseCase } from 'src/application/use-cases/account/delete-company-banner.usecase';
import { DeleteCompanyLogoUseCase } from 'src/application/use-cases/account/delete-company-logo.usecase';
import { UpdateMyCompanyUseCase } from 'src/application/use-cases/account/update-my-company.usecase';
import { UpdateMyProfileUseCase } from 'src/application/use-cases/account/update-my-profile.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseApiBooleanDto } from 'src/common/dto/response.dto';
import {
  RequestChangePasswordDto,
  RequestUpdateMyCompanyDto,
  RequestUpdateMyProfileDto,
} from '../dtos/req.account.dto';
import {
  ResponseApiUpdateCompanyDto,
  ResponseApiMyProfileDto,
  ResponseApiUpdateProfileDto,
} from '../dtos/res.account.dto';

@Controller({ path: 'account', version: '1' })
@ApiTags('Account')
export class AccountController extends BaseController {
  constructor(
    private readonly getMyProfileQuery: GetMyProfileQuery,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly updateMyCompanyUseCase: UpdateMyCompanyUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deleteAvatarUseCase: DeleteAvatarUseCase,
    private readonly deleteCompanyLogoUseCase: DeleteCompanyLogoUseCase,
    private readonly deleteCompanyBannerUseCase: DeleteCompanyBannerUseCase,
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
    type: ResponseApiUpdateProfileDto,
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
    type: ResponseApiUpdateCompanyDto,
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
    type: ResponseApiBooleanDto,
  })
  async changePassword(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestChangePasswordDto,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return await this.changePasswordUseCase.execute(user.id, dto);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Delete avatar' })
  @AuthRequired(EUserRole.JOB_SEEKER)
  async deleteAvatar(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return await this.deleteAvatarUseCase.execute(user.id);
  }

  @Delete('me/logo')
  @ApiOperation({ summary: 'Delete company logo' })
  @AuthRequired(EUserRole.RECRUITER)
  async deleteCompanyLogo(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return await this.deleteCompanyLogoUseCase.execute(user.id);
  }

  @Delete('me/banner')
  @ApiOperation({ summary: 'Delete company banner' })
  @AuthRequired(EUserRole.RECRUITER)
  async deleteCompanyBanner(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return await this.deleteCompanyBannerUseCase.execute(user.id);
  }
}
