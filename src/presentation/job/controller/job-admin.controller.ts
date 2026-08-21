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
import {
  RequestCloseJobDto,
  RequestGetJobsDto,
  RequestRejectJobDto,
} from '../dtos/req.job.dto';
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
    summary: 'Lay danh sach job de duyet va quan ly. Truy cap: Admin.',
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
    summary: 'Lay chi tiet job theo slug de duyet va chinh sua. Truy cap: Admin.',
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
    summary: 'Duyet mot job dang cho xu ly. Truy cap: Admin.',
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
    summary: 'Tu choi mot job dang cho xu ly kem ly do. Truy cap: Admin.',
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
    summary: 'Dong mot job. Truy cap: Admin.',
  })
  @ApiResponse({ status: 200, type: ResponseApiAdminJobDto })
  async closeJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestCloseJobDto,
  ): Promise<IResponseApiAdminJobDto> {
    return await this.reviewJobUseCase.close(id, dto);
  }
}
