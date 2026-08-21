import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiRecruiterApplicationTrendDto,
  IResponseApiRecruiterOverviewDto,
} from 'src/application/dtos/recruiter-analytics/res.recruiter-analytics.dto';
import { GetRecruiterApplicationTrendQuery } from 'src/application/queries/recruiter-analytics/get-recruiter-application-trend.query';
import { GetRecruiterOverviewQuery } from 'src/application/queries/recruiter-analytics/get-recruiter-overview.query';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestRecruiterApplicationTrendDto } from '../dtos/req.recruiter-analytics.dto';
import {
  ResponseApiRecruiterApplicationTrendDto,
  ResponseApiRecruiterOverviewDto,
} from '../dtos/res.recruiter-analytics.dto';

@ApiTags('Recruiter Analytics')
@Controller({ path: 'recruiter/analytics', version: '1' })
@AuthRequired(EUserRole.RECRUITER)
export class RecruiterAnalyticsController extends BaseController {
  constructor(
    private readonly getRecruiterOverviewQuery: GetRecruiterOverviewQuery,
    private readonly getRecruiterApplicationTrendQuery: GetRecruiterApplicationTrendQuery,
  ) {
    super(new Logger(RecruiterAnalyticsController.name));
  }

  @Get('overview')
  @ApiOperation({ summary: 'Lay thong ke tong quan dashboard recruiter.' })
  @ApiResponse({ status: 200, type: ResponseApiRecruiterOverviewDto })
  async getOverview(
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<IResponseApiRecruiterOverviewDto> {
    return await this.getRecruiterOverviewQuery.execute(user.id);
  }

  @Get('application-trend')
  @ApiOperation({
    summary: 'Lay xu huong ho so ung tuyen theo tuan, thang, quy hoac nam.',
  })
  @ApiResponse({ status: 200, type: ResponseApiRecruiterApplicationTrendDto })
  async getApplicationTrend(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestRecruiterApplicationTrendDto,
  ): Promise<IResponseApiRecruiterApplicationTrendDto> {
    return await this.getRecruiterApplicationTrendQuery.execute(user.id, query);
  }
}
