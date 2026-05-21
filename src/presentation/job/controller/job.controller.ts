import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiJobDto,
  IResponseListApiJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { GetJobByIdQuery } from 'src/application/queries/job/get-job-by-id.query';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { CreateJobUseCase } from 'src/application/use-cases/job/create-job.usecase';
import { DeleteJobUseCase } from 'src/application/use-cases/job/delete-job.usecase';
import { ReviewJobUseCase } from 'src/application/use-cases/job/review-job.usecase';
import { UpdateJobUseCase } from 'src/application/use-cases/job/update-job.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { ApiResponseBooleanDto } from 'src/common/dto/response.dto';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestCreateJobDto,
  RequestGetJobsDto,
  RequestRejectJobDto,
  RequestUpdateJobDto,
} from '../dtos/req.job.dto';
import { ResponseApiJobDto, ResponseListApiJobDto } from '../dtos/res.job.dto';

@Controller({ path: 'jobs', version: '1' })
@ApiTags('Jobs')
export class JobController extends BaseController {
  constructor(
    private readonly getJobsQuery: GetJobsQuery,
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly getJobByIdQuery: GetJobByIdQuery,
    private readonly updateJobUseCase: UpdateJobUseCase,
    private readonly deleteJobUseCase: DeleteJobUseCase,
    private readonly reviewJobUseCase: ReviewJobUseCase,
  ) {
    super(new Logger(JobController.name));
  }

  @Get()
  @ApiOperation({ summary: 'Search public open jobs (Public)' })
  @ApiResponse({ status: 200, type: ResponseListApiJobDto })
  async getPublicJobs(
    @Query() query: RequestGetJobsDto,
  ): Promise<IResponseListApiJobDto> {
    return await this.getJobsQuery.execute(
      { ...query, status: query.status || EJobStatus.OPEN },
      'public',
    );
  }

  @Get('my')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Get my company jobs (Recruiter)' })
  @ApiResponse({ status: 200, type: ResponseListApiJobDto })
  async getMyJobs(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetJobsDto,
  ): Promise<IResponseListApiJobDto> {
    return await this.getJobsQuery.executeForRecruiter(user.id, query);
  }

  @Get('admin')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Get all jobs (Admin)' })
  @ApiResponse({ status: 200, type: ResponseListApiJobDto })
  async getAdminJobs(
    @Query() query: RequestGetJobsDto,
  ): Promise<IResponseListApiJobDto> {
    return await this.getJobsQuery.execute(query, 'admin');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job detail' })
  @ApiResponse({ status: 200, type: ResponseApiJobDto })
  async getJob(@Param('id') id: string): Promise<IResponseApiJobDto> {
    return await this.getJobByIdQuery.execute(id);
  }

  @Post()
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Create recruiter job' })
  @ApiResponse({ status: 201, type: ResponseApiJobDto })
  async createJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestCreateJobDto,
  ): Promise<IResponseApiJobDto> {
    return await this.createJobUseCase.execute(user.id, {
      ...dto,
      expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : undefined,
    });
  }

  @Patch(':id')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Update recruiter job' })
  @ApiResponse({ status: 200, type: ResponseApiJobDto })
  async updateJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() dto: RequestUpdateJobDto,
  ): Promise<IResponseApiJobDto> {
    return await this.updateJobUseCase.execute(id, user.id, {
      ...dto,
      expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : undefined,
    });
  }

  @Delete(':id')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Delete recruiter job' })
  @ApiResponse({ status: 200, type: ApiResponseBooleanDto })
  async deleteJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return await this.deleteJobUseCase.execute(id, user.id);
  }

  @Patch(':id/approve')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Approve job' })
  @ApiResponse({ status: 200, type: ResponseApiJobDto })
  async approveJob(@Param('id') id: string): Promise<IResponseApiJobDto> {
    return await this.reviewJobUseCase.approve(id);
  }

  @Patch(':id/reject')
  @AuthRequired(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Reject job' })
  @ApiResponse({ status: 200, type: ResponseApiJobDto })
  async rejectJob(
    @Param('id') id: string,
    @Body() dto: RequestRejectJobDto,
  ): Promise<IResponseApiJobDto> {
    return await this.reviewJobUseCase.reject(id, dto);
  }

  @Patch(':id/close')
  @AuthRequired(EUserRole.ADMIN, EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Close job' })
  @ApiResponse({ status: 200, type: ResponseApiJobDto })
  async closeJob(@Param('id') id: string): Promise<IResponseApiJobDto> {
    return await this.reviewJobUseCase.close(id);
  }
}
