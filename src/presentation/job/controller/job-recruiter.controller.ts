import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiRecruiterJobDto,
  IResponseListApiRecruiterJobDto,
} from 'src/application/dtos/job/res.job.dto';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { CreateJobUseCase } from 'src/application/use-cases/job/create-job.usecase';
import { DeleteJobUseCase } from 'src/application/use-cases/job/delete-job.usecase';
import { ReviewJobUseCase } from 'src/application/use-cases/job/review-job.usecase';
import { UpdateJobUseCase } from 'src/application/use-cases/job/update-job.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import {
  RequestCreateJobDto,
  RequestGetJobsDto,
  RequestUpdateJobDto,
} from '../dtos/req.job.dto';
import {
  ResponseApiRecruiterJobDto,
  ResponseListApiRecruiterJobDto,
} from '../dtos/res.job.dto';

@Controller({ path: 'recruiter/jobs', version: '1' })
@ApiTags('Jobs - Recruiter')
export class JobRecruiterController extends BaseController {
  constructor(
    private readonly getJobsQuery: GetJobsQuery,
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly updateJobUseCase: UpdateJobUseCase,
    private readonly deleteJobUseCase: DeleteJobUseCase,
    private readonly reviewJobUseCase: ReviewJobUseCase,
  ) {
    super(new Logger(JobRecruiterController.name));
  }

  @Get()
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Get jobs of my company. Access: Recruiter.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiRecruiterJobDto })
  async getMyJobs(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetJobsDto,
  ): Promise<IResponseListApiRecruiterJobDto> {
    return await this.getJobsQuery.executeForRecruiter(user.id, query);
  }

  @Post()
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Create a new job for my company. Access: Recruiter.',
  })
  @ApiResponse({ status: 201, type: ResponseApiRecruiterJobDto })
  async createJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestCreateJobDto,
  ): Promise<IResponseApiRecruiterJobDto> {
    return await this.createJobUseCase.execute(user.id, dto);
  }

  @Patch(':id')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Update a job of my company. Access: Recruiter.',
  })
  @ApiResponse({ status: 200, type: ResponseApiRecruiterJobDto })
  async updateJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestUpdateJobDto,
  ): Promise<IResponseApiRecruiterJobDto> {
    return await this.updateJobUseCase.execute(id, user.id, dto);
  }

  @Delete(':id')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Delete a job of my company. Access: Recruiter.',
  })
  @ApiResponse({ status: 200, type: ResponseApiNullDto })
  async deleteJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiNullDto> {
    return await this.deleteJobUseCase.execute(id, user.id);
  }

  @Patch(':id/close')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Close a job. Access: Recruiter.',
  })
  @ApiResponse({ status: 200, type: ResponseApiRecruiterJobDto })
  async closeJob(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiRecruiterJobDto> {
    return await this.reviewJobUseCase.close(id);
  }
}
