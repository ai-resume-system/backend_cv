import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiPublicJobDto,
  IResponseListApiPublicJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { GetJobBySlugQuery } from 'src/application/queries/job/get-job-by-slug.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { BaseController } from 'src/common/base/base.controller';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestGetJobsDto } from '../dtos/req.job.dto';
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
