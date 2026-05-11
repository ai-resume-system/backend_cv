import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateJobApplicationUseCase } from 'src/application/use-cases/job-application/create-job-application.usecase';
import { WithdrawJobApplicationUseCase } from 'src/application/use-cases/job-application/withdraw-job-application.usecase';
import { UpdateJobApplicationStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-status.usecase';
import { GetMyJobApplicationsQuery } from 'src/application/queries/job-application/get-my-job-applications.query';
import { GetJobApplicationsByJobQuery } from 'src/application/queries/job-application/get-job-applications-by-job.query';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestCreateJobApplicationDto,
  RequestUpdateJobApplicationStatusDto,
} from '../dtos/req.job-application.dto';
import { ResponseJobApplicationDto } from '../dtos/res.job-application.dto';

@ApiTags('Job Applications')
@Controller({ path: 'job-application', version: '1' })
export class JobApplicationController extends BaseController {
  constructor(
    private readonly createJobApplicationUseCase: CreateJobApplicationUseCase,
    private readonly withdrawJobApplicationUseCase: WithdrawJobApplicationUseCase,
    private readonly updateJobApplicationStatusUseCase: UpdateJobApplicationStatusUseCase,
    private readonly getMyJobApplicationsQuery: GetMyJobApplicationsQuery,
    private readonly getJobApplicationsByJobQuery: GetJobApplicationsByJobQuery,
  ) {
    super(new Logger(JobApplicationController.name));
  }

  @Post()
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Apply to a job (Job Seeker)' })
  @ApiResponse({ status: 201, description: 'Job application created' })
  async createJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestCreateJobApplicationDto,
  ): Promise<{ data: ResponseJobApplicationDto }> {
    return this.createJobApplicationUseCase.execute(user.id, dto);
  }

  @Get('me')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Get my job applications (Job Seeker)' })
  @ApiResponse({ status: 200, description: 'My job applications list' })
  async getMyJobApplications(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: { page?: number; limit?: number },
  ): Promise<{ data: ResponseJobApplicationDto[]; pagination: any }> {
    return this.getMyJobApplicationsQuery.execute(user.id, query);
  }

  @Get(':id')
  @AuthRequired()
  @ApiOperation({
    summary: 'Get job application by ID (Job Seeker & Recruiter)',
  })
  @ApiResponse({ status: 200, description: 'Job application details' })
  async getJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<{ data: ResponseJobApplicationDto }> {
    return this.getMyJobApplicationsQuery.executeById(id, user.id);
  }

  @Delete(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Withdraw job application (Job Seeker)' })
  @ApiResponse({ status: 200, description: 'Job application withdrawn' })
  async withdrawJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<{ data: ResponseJobApplicationDto }> {
    return this.withdrawJobApplicationUseCase.execute(user.id, id);
  }

  @Get('/jobs/:jobId/job-application')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Get job applications for a job (Recruiter)' })
  @ApiResponse({ status: 200, description: 'Job applications list' })
  async getJobApplications(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('jobId') jobId: string,
    @Query() query: { page?: number; limit?: number },
  ): Promise<{ data: ResponseJobApplicationDto[]; pagination: any }> {
    return this.getJobApplicationsByJobQuery.execute(jobId, user.id, query);
  }

  @Patch(':id/status')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({ summary: 'Update job application status (Recruiter)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: RequestUpdateJobApplicationStatusDto,
  ): Promise<{ data: ResponseJobApplicationDto }> {
    return this.updateJobApplicationStatusUseCase.execute(id, dto);
  }
}
