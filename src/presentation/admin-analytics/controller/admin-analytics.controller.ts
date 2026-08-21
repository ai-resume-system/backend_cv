import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiAdminGrowthDto,
  IResponseApiAdminOverviewDto,
  IResponseApiAdminRecentActivityDto,
} from 'src/application/dtos/admin-analytics/res.admin-analytics.dto';
import { GetAdminApplicationGrowthQuery } from 'src/application/queries/admin-analytics/get-admin-application-growth.query';
import { GetAdminJobGrowthQuery } from 'src/application/queries/admin-analytics/get-admin-job-growth.query';
import { GetAdminOverviewQuery } from 'src/application/queries/admin-analytics/get-admin-overview.query';
import { GetAdminRecentActivitiesQuery } from 'src/application/queries/admin-analytics/get-admin-recent-activities.query';
import { GetAdminUserGrowthQuery } from 'src/application/queries/admin-analytics/get-admin-user-growth.query';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { RequestAdminGrowthDto } from '../dtos/req.admin-analytics.dto';
import {
  ResponseApiAdminGrowthDto,
  ResponseApiAdminOverviewDto,
  ResponseApiAdminRecentActivityListDto,
} from '../dtos/res.admin-analytics.dto';

@Controller({ path: 'admin/analytics', version: '1' })
@ApiTags('Admin Analytics')
@AuthRequired(EUserRole.ADMIN)
export class AdminAnalyticsController extends BaseController {
  constructor(
    private readonly getAdminOverviewQuery: GetAdminOverviewQuery,
    private readonly getAdminUserGrowthQuery: GetAdminUserGrowthQuery,
    private readonly getAdminJobGrowthQuery: GetAdminJobGrowthQuery,
    private readonly getAdminApplicationGrowthQuery: GetAdminApplicationGrowthQuery,
    private readonly getAdminRecentActivitiesQuery: GetAdminRecentActivitiesQuery,
  ) {
    super(new Logger(AdminAnalyticsController.name));
  }

  @Get('overview')
  @ApiOperation({ summary: 'Lay thong ke tong quan danh cho admin.' })
  @ApiResponse({ status: 200, type: ResponseApiAdminOverviewDto })
  async getOverview(): Promise<IResponseApiAdminOverviewDto> {
    return await this.getAdminOverviewQuery.execute();
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Lay bieu do tang truong nguoi dung.' })
  @ApiResponse({ status: 200, type: ResponseApiAdminGrowthDto })
  async getUserGrowth(
    @Query() dto: RequestAdminGrowthDto,
  ): Promise<IResponseApiAdminGrowthDto> {
    return await this.getAdminUserGrowthQuery.execute(dto);
  }

  @Get('job-growth')
  @ApiOperation({ summary: 'Lay bieu do tang truong tin tuyen dung.' })
  @ApiResponse({ status: 200, type: ResponseApiAdminGrowthDto })
  async getJobGrowth(
    @Query() dto: RequestAdminGrowthDto,
  ): Promise<IResponseApiAdminGrowthDto> {
    return await this.getAdminJobGrowthQuery.execute(dto);
  }

  @Get('application-growth')
  @ApiOperation({ summary: 'Lay bieu do tang truong luot ung tuyen.' })
  @ApiResponse({ status: 200, type: ResponseApiAdminGrowthDto })
  async getApplicationGrowth(
    @Query() dto: RequestAdminGrowthDto,
  ): Promise<IResponseApiAdminGrowthDto> {
    return await this.getAdminApplicationGrowthQuery.execute(dto);
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Lay hoat dong gan day cho dashboard admin.' })
  @ApiResponse({ status: 200, type: ResponseApiAdminRecentActivityListDto })
  async getRecentActivities(): Promise<IResponseApiAdminRecentActivityDto> {
    return await this.getAdminRecentActivitiesQuery.execute();
  }
}
