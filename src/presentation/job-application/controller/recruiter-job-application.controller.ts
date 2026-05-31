import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  IResponseApiRecruiterJobApplicationDto,
  IResponseListApiRecruiterJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import { UpdateJobApplicationStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-status.usecase';
import { GetJobApplicationByIdQuery } from 'src/application/queries/job-application/get-job-application-by-id.query';
import { GetJobApplicationsByJobQuery } from 'src/application/queries/job-application/get-job-applications-by-job.query';
import { GetJobApplicationCVQuery } from 'src/application/queries/job-application/get-job-application-cv.querry';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestGetJobApplicationsDto,
  RequestUpdateJobApplicationStatusDto,
} from '../dtos/req.job-application.dto';
import {
  ResponseApiRecruiterJobApplicationDto,
  ResponseListApiRecruiterJobApplicationDto,
} from '../dtos/res.job-application.dto';

@ApiTags('Job Applications - Recruiter')
@ApiExtraModels(ResponseApiRecruiterJobApplicationDto)
@Controller({ path: 'recruiter/job-applications', version: '1' })
export class RecruiterJobApplicationController extends BaseController {
  constructor(
    private readonly updateJobApplicationStatusUseCase: UpdateJobApplicationStatusUseCase,
    private readonly getJobApplicationByIdQuery: GetJobApplicationByIdQuery,
    private readonly getJobApplicationsByJobQuery: GetJobApplicationsByJobQuery,
    private readonly getJobApplicationCVQuery: GetJobApplicationCVQuery,
  ) {
    super(new Logger(RecruiterJobApplicationController.name));
  }

  @Get('jobs/:jobId')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Get job applications by job id. Access: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job applications list',
    type: ResponseListApiRecruiterJobApplicationDto,
  })
  async getJobApplications(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('jobId') jobId: string,
    @Query() query: RequestGetJobApplicationsDto,
  ): Promise<IResponseListApiRecruiterJobApplicationDto> {
    return await this.getJobApplicationsByJobQuery.execute(
      jobId,
      user.id,
      query,
    );
  }

  @Get(':id')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Get job application detail by id. Access: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job application details',
    type: ResponseApiRecruiterJobApplicationDto,
  })
  async getJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return (await this.getJobApplicationByIdQuery.execute(
      id,
      user,
    )) as IResponseApiRecruiterJobApplicationDto;
  }

  @Get(':applicationId/cv')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Get CV of a job application. Access: Recruiter.',
  })
  @ApiResponse({ status: 200, description: 'CV details' })
  async getApplicationCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('applicationId') applicationId: string,
  ): Promise<any> {
    return await this.getJobApplicationCVQuery.execute(applicationId, user.id);
  }

  @Patch(':id/status')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Update job application status. Access: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: ResponseApiRecruiterJobApplicationDto,
  })
  async updateStatus(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() dto: RequestUpdateJobApplicationStatusDto,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return await this.updateJobApplicationStatusUseCase.execute(
      user.id,
      id,
      dto,
    );
  }
}
