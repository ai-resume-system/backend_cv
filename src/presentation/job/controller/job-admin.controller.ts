import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiAdminJobDto,
  IResponseListApiAdminJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { GetJobBySlugQuery } from 'src/application/queries/job/get-job-by-slug.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { ReviewJobUseCase } from 'src/application/use-cases/job/review-job.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { RequestGetJobsDto, RequestRejectJobDto } from '../dtos/req.job.dto';
import {
  ResponseApiAdminJobDto,
  ResponseListApiAdminJobDto,
} from '../dtos/res.job.dto';

@Controller({ path: 'admin/jobs', version: '1' })
@ApiTags('Jobs - Admin')
export class JobAdminController extends BaseController {
  constructor(
    private readonly getJobsQuery: GetJobsQuery,
    private readonly getJobBySlugQuery: GetJobBySlugQuery,
    private readonly reviewJobUseCase: ReviewJobUseCase,
  ) {
    super(new Logger(JobAdminController.name));
  }

  @Get()
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all jobs for moderation and management. Access: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiAdminJobDto })
  async getAdminJobs(
    @Query() query: RequestGetJobsDto,
  ): Promise<IResponseListApiAdminJobDto> {
    return await this.getJobsQuery.executeAdmin(query);
  }

  @Get(':slug')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({
    summary: 'Get job detail by slug for moderation and editing. Access: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiAdminJobDto })
  async getAdminJobBySlug(
    @Param('slug') slug: string,
  ): Promise<IResponseApiAdminJobDto> {
    return await this.getJobBySlugQuery.executeAdmin(slug);
  }

  @Patch(':id/approve')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({
    summary: 'Approve a pending job. Access: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiAdminJobDto })
  async approveJob(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiAdminJobDto> {
    return await this.reviewJobUseCase.approve(id);
  }

  @Patch(':id/reject')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({
    summary: 'Reject a pending job with reason. Access: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiAdminJobDto })
  async rejectJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestRejectJobDto,
  ): Promise<IResponseApiAdminJobDto> {
    return await this.reviewJobUseCase.reject(id, dto);
  }

  @Patch(':id/close')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({
    summary: 'Close a job. Access: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiAdminJobDto })
  async closeJob(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiAdminJobDto> {
    return await this.reviewJobUseCase.close(id);
  }
}
