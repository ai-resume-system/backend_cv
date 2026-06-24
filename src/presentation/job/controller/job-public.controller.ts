import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiJobMatchDto,
  IResponseApiJobMatchOrEmptyDto,
  IResponseApiPublicJobDto,
  IResponseListApiPublicJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { GetJobBySlugQuery } from 'src/application/queries/job/get-job-by-slug.query';
import { GetJobMatchQuery } from 'src/application/queries/job/get-job-match.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { GetRelatedJobsQuery } from 'src/application/queries/job/get-related-jobs.query';
import { CalculateJobMatchUseCase } from 'src/application/use-cases/job/calculate-job-match.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestCalculateJobMatchDto,
  RequestGetJobMatchDto,
  RequestGetJobsDto,
  RequestGetRelatedJobsDto,
} from '../dtos/req.job.dto';
import {
  ResponseApiJobMatchDto,
  ResponseApiPublicJobDto,
  ResponseListApiPublicJobDto,
} from '../dtos/res.job.dto';

@Controller({ path: 'jobs', version: '1' })
@ApiTags('Jobs - Public')
export class JobPublicController extends BaseController {
  constructor(
    private readonly getJobsQuery: GetJobsQuery,
    private readonly getJobBySlugQuery: GetJobBySlugQuery,
    private readonly getJobMatchQuery: GetJobMatchQuery,
    private readonly getRelatedJobsQuery: GetRelatedJobsQuery,
    private readonly calculateJobMatchUseCase: CalculateJobMatchUseCase,
  ) {
    super(new Logger(JobPublicController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Lay danh sach job public dang mo. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiPublicJobDto })
  async getPublicJobs(
    @Query() query: RequestGetJobsDto,
    @AuthCurrentUser() user?: ICurrentUser,
  ): Promise<IResponseListApiPublicJobDto> {
    return await this.getJobsQuery.executePublic(
      { ...query, status: query.status || EJobStatus.OPEN },
      user?.id,
    );
  }

  @Get(':slug/related')
  @ApiOperation({
    summary: 'Lay danh sach job lien quan theo slug job goc. Truy cap: Public, Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiPublicJobDto })
  async getRelatedJobs(
    @Param('slug') slug: string,
    @Query() query: RequestGetRelatedJobsDto,
    @AuthCurrentUser() user?: ICurrentUser,
  ): Promise<IResponseListApiPublicJobDto> {
    return await this.getRelatedJobsQuery.execute(slug, query, user?.id);
  }

  @Get(':slug/match')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Lay ket qua match da co giua CV va job. Truy cap: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiJobMatchDto })
  async getJobMatch(
    @Param('slug') slug: string,
    @Query() query: RequestGetJobMatchDto,
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<IResponseApiJobMatchOrEmptyDto> {
    return await this.getJobMatchQuery.execute(slug, query.cvId, user.id);
  }

  @Post(':slug/match')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Tinh va luu ket qua match giua CV va job. Truy cap: Job Seeker.',
  })
  @ApiResponse({ status: 201, type: ResponseApiJobMatchDto })
  async calculateJobMatch(
    @Param('slug') slug: string,
    @Body() dto: RequestCalculateJobMatchDto,
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<IResponseApiJobMatchDto> {
    return await this.calculateJobMatchUseCase.execute(slug, dto, user.id);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lay chi tiet job theo slug. Truy cap: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiPublicJobDto })
  async getJob(
    @Param('slug') slug: string,
    @AuthCurrentUser() user?: ICurrentUser,
  ): Promise<IResponseApiPublicJobDto> {
    return await this.getJobBySlugQuery.execute(slug, user?.id);
  }
}
