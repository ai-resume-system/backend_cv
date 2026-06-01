import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  IResponseApiJobSeekerJobApplicationDto,
  IResponseListApiJobSeekerJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import { CreateJobApplicationUseCase } from 'src/application/use-cases/job-application/create-job-application.usecase';
import { WithdrawJobApplicationUseCase } from 'src/application/use-cases/job-application/withdraw-job-application.usecase';
import { GetJobApplicationByIdQuery } from 'src/application/queries/job-application/get-job-application-by-id.query';
import { GetMyJobApplicationsQuery } from 'src/application/queries/job-application/get-my-job-applications.query';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestCreateJobApplicationDto,
  RequestGetJobApplicationsDto,
} from '../dtos/req.job-application.dto';
import {
  ResponseApiJobSeekerJobApplicationDto,
  ResponseListApiJobSeekerJobApplicationDto,
} from '../dtos/res.job-application.dto';

@ApiTags('Job Applications - Job Seeker')
@ApiExtraModels(ResponseApiJobSeekerJobApplicationDto)
@Controller({ path: 'job-applications', version: '1' })
export class JobSeekerJobApplicationController extends BaseController {
  constructor(
    private readonly createJobApplicationUseCase: CreateJobApplicationUseCase,
    private readonly withdrawJobApplicationUseCase: WithdrawJobApplicationUseCase,
    private readonly getJobApplicationByIdQuery: GetJobApplicationByIdQuery,
    private readonly getMyJobApplicationsQuery: GetMyJobApplicationsQuery,
  ) {
    super(new Logger(JobSeekerJobApplicationController.name));
  }

  @Post()
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Apply to a job. Access: Job Seeker.',
  })
  @ApiResponse({
    status: 201,
    description: 'Job application created',
    type: ResponseApiJobSeekerJobApplicationDto,
  })
  async createJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestCreateJobApplicationDto,
  ): Promise<IResponseApiJobSeekerJobApplicationDto> {
    return await this.createJobApplicationUseCase.execute(user.id, dto);
  }

  @Get('me')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Get my job applications. Access: Job Seeker.',
  })
  @ApiResponse({
    status: 200,
    description: 'My job applications list',
    type: ResponseListApiJobSeekerJobApplicationDto,
  })
  async getMyJobApplications(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetJobApplicationsDto,
  ): Promise<IResponseListApiJobSeekerJobApplicationDto> {
    return await this.getMyJobApplicationsQuery.execute(user.id, query);
  }

  @Get(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Get my job application detail by id. Access: Job Seeker.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job application details',
    type: ResponseApiJobSeekerJobApplicationDto,
  })
  async getJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiJobSeekerJobApplicationDto> {
    return (await this.getJobApplicationByIdQuery.execute(
      id,
      user,
    )) as IResponseApiJobSeekerJobApplicationDto;
  }

  @Delete(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Withdraw a job application. Access: Job Seeker.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job application withdrawn',
    type: ResponseApiJobSeekerJobApplicationDto,
  })
  async withdrawJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiJobSeekerJobApplicationDto> {
    return await this.withdrawJobApplicationUseCase.execute(user.id, id);
  }
}
