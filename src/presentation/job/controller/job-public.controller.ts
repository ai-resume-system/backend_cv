import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiPublicJobDto,
  IResponseListApiPublicJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { GetJobBySlugQuery } from 'src/application/queries/job/get-job-by-slug.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { GetRelatedJobsQuery } from 'src/application/queries/job/get-related-jobs.query';
import { BaseController } from 'src/common/base/base.controller';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestGetJobsDto,
  RequestGetRelatedJobsDto,
} from '../dtos/req.job.dto';
import {
  ResponseApiPublicJobDto,
  ResponseListApiPublicJobDto,
} from '../dtos/res.job.dto';

@Controller({ path: 'jobs', version: '1' })
@ApiTags('Jobs - Public')
export class JobPublicController extends BaseController {
  constructor(
    private readonly getJobsQuery: GetJobsQuery,
    private readonly getJobBySlugQuery: GetJobBySlugQuery,
    private readonly getRelatedJobsQuery: GetRelatedJobsQuery,
  ) {
    super(new Logger(JobPublicController.name));
  }

  @Get()
  @ApiOperation({
    summary:
      'Search public open jobs. Access: Public, Job Seeker, Recruiter, Admin.',
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
    summary:
      'Get related public jobs by base job slug. Access: Public, Job Seeker',
  })
  @ApiResponse({ status: 200, type: ResponseListApiPublicJobDto })
  async getRelatedJobs(
    @Param('slug') slug: string,
    @Query() query: RequestGetRelatedJobsDto,
    @AuthCurrentUser() user?: ICurrentUser,
  ): Promise<IResponseListApiPublicJobDto> {
    return await this.getRelatedJobsQuery.execute(slug, query, user?.id);
  }

  @Get(':slug')
  @ApiOperation({
    summary:
      'Get job detail by slug. Access: Public, Job Seeker, Recruiter, Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiPublicJobDto })
  async getJob(
    @Param('slug') slug: string,
    @AuthCurrentUser() user?: ICurrentUser,
  ): Promise<IResponseApiPublicJobDto> {
    return await this.getJobBySlugQuery.execute(slug, user?.id);
  }
}
