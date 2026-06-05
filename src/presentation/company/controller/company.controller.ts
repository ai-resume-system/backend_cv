import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiCompanyDto,
  IResponseListApiCompanyDto,
} from 'src/application/dtos/company/res.company.dto';
import type { IResponseListApiPublicJobDto } from 'src/application/dtos/job/res.job.dto';
import { GetCompaniesQuery } from 'src/application/queries/company/get-companies.query';
import { GetCompanyBySlugQuery } from 'src/application/queries/company/get-company-by-slug.query';
import { GetCompanyJobsQuery } from 'src/application/queries/company/get-company-jobs.query';
import { BaseController } from 'src/common/base/base.controller';
import {
  AuthCurrentUser,
} from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestGetJobsDto } from 'src/presentation/job/dtos/req.job.dto';
import { ResponseListApiPublicJobDto } from 'src/presentation/job/dtos/res.job.dto';
import { RequestGetCompaniesDto } from '../dtos/req.company.dto';
import {
  ResponseApiCompanyDto,
  ResponseListApiCompanyDto,
} from '../dtos/res.company.dto';

@Controller({ path: 'companies', version: '1' })
@ApiTags('Companies')
export class CompanyController extends BaseController {
  constructor(
    private readonly getCompaniesQuery: GetCompaniesQuery,
    private readonly getCompanyBySlugQuery: GetCompanyBySlugQuery,
    private readonly getCompanyJobsQuery: GetCompanyJobsQuery,
  ) {
    super(new Logger(CompanyController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Lay danh sach cong ty public. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiCompanyDto })
  async getCompanies(
    @Query() dto: RequestGetCompaniesDto,
  ): Promise<IResponseListApiCompanyDto> {
    return await this.getCompaniesQuery.execute(dto);
  }

  @Get(':slug/jobs')
  @ApiOperation({
    summary: 'Lay danh sach job public theo slug cong ty. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiPublicJobDto })
  async getCompanyJobs(
    @Param('slug') slug: string,
    @Query() dto: RequestGetJobsDto,
    @AuthCurrentUser() user?: ICurrentUser,
  ): Promise<IResponseListApiPublicJobDto> {
    return await this.getCompanyJobsQuery.execute(slug, dto, user?.id);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lay chi tiet cong ty theo slug. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiCompanyDto })
  async getCompanyBySlug(
    @Param('slug') slug: string,
  ): Promise<IResponseApiCompanyDto> {
    return await this.getCompanyBySlugQuery.execute(slug);
  }
}
