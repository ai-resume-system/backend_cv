import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
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
import { GetJobApplicationByIdQuery } from 'src/application/queries/job-application/get-job-application-by-id.query';
import { GetJobApplicationCVQuery } from 'src/application/queries/job-application/get-job-application-cv.querry';
import { GetJobApplicationsByJobQuery } from 'src/application/queries/job-application/get-job-applications-by-job.query';
import { GetRecruiterInterviewsQuery } from 'src/application/queries/job-application/get-recruiter-interviews.query';
import { GetRecruiterJobApplicationsQuery } from 'src/application/queries/job-application/get-recruiter-job-applications.query';
import { GetRecruiterNewApplicantsQuery } from 'src/application/queries/job-application/get-recruiter-new-applicants.query';
import { UpdateJobApplicationInterviewStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-interview-status.usecase';
import { UpdateJobApplicationStatusUseCase } from 'src/application/use-cases/job-application/update-job-application-status.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestGetJobApplicationsDto,
  RequestGetRecruiterInterviewsDto,
  RequestGetRecruiterJobApplicationsDto,
  RequestGetRecruiterNewApplicantsDto,
  RequestUpdateJobApplicationInterviewStatusDto,
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
    private readonly getRecruiterJobApplicationsQuery: GetRecruiterJobApplicationsQuery,
    private readonly getRecruiterNewApplicantsQuery: GetRecruiterNewApplicantsQuery,
    private readonly getRecruiterInterviewsQuery: GetRecruiterInterviewsQuery,
    private readonly updateJobApplicationInterviewStatusUseCase: UpdateJobApplicationInterviewStatusUseCase,
    private readonly getJobApplicationCVQuery: GetJobApplicationCVQuery,
  ) {
    super(new Logger(RecruiterJobApplicationController.name));
  }

  @Get()
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Lay tat ca don ung tuyen cua cong ty. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Company-wide job applications list',
    type: ResponseListApiRecruiterJobApplicationDto,
  })
  async getCompanyJobApplications(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetRecruiterJobApplicationsDto,
  ): Promise<IResponseListApiRecruiterJobApplicationDto> {
    return await this.getRecruiterJobApplicationsQuery.execute(user.id, query);
  }

  @Get('new')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary:
      'Lay danh sach ung vien moi ung tuyen trong cong ty. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Newest applied applicants',
    type: ResponseListApiRecruiterJobApplicationDto,
  })
  async getNewApplicants(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetRecruiterNewApplicantsDto,
  ): Promise<IResponseListApiRecruiterJobApplicationDto> {
    return await this.getRecruiterNewApplicantsQuery.execute(user.id, query);
  }

  @Get('interviews')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Lay danh sach lich phong van cua cong ty. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interview schedules list',
    type: ResponseListApiRecruiterJobApplicationDto,
  })
  async getInterviews(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetRecruiterInterviewsDto,
  ): Promise<IResponseListApiRecruiterJobApplicationDto> {
    return await this.getRecruiterInterviewsQuery.execute(user.id, query);
  }

  @Get('jobs/:jobId')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Lay danh sach don ung tuyen theo job id. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job applications list',
    type: ResponseListApiRecruiterJobApplicationDto,
  })
  async getJobApplications(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
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
    summary: 'Lay chi tiet don ung tuyen theo id. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Job application details',
    type: ResponseApiRecruiterJobApplicationDto,
  })
  async getJobApplication(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return (await this.getJobApplicationByIdQuery.execute(
      id,
      user,
    )) as IResponseApiRecruiterJobApplicationDto;
  }

  @Get(':applicationId/cv')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Lay CV cua mot don ung tuyen. Truy cap: Recruiter.',
  })
  @ApiResponse({ status: 200, description: 'CV details' })
  async getApplicationCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ): Promise<any> {
    return await this.getJobApplicationCVQuery.execute(applicationId, user.id);
  }

  @Patch(':id/status')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Cap nhat trang thai don ung tuyen. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: ResponseApiRecruiterJobApplicationDto,
  })
  async updateStatus(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestUpdateJobApplicationStatusDto,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return await this.updateJobApplicationStatusUseCase.execute(
      user.id,
      id,
      dto,
    );
  }

  @Patch(':id/interview-status')
  @AuthRequired(EUserRole.RECRUITER)
  @ApiOperation({
    summary: 'Cap nhat tien do phong van. Truy cap: Recruiter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interview progress updated',
    type: ResponseApiRecruiterJobApplicationDto,
  })
  async updateInterviewStatus(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestUpdateJobApplicationInterviewStatusDto,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return await this.updateJobApplicationInterviewStatusUseCase.execute(
      user.id,
      id,
      dto,
    );
  }
}
