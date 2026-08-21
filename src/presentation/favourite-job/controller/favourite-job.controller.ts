import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiFavouriteJobDto,
  IResponseListApiFavouriteJobDto,
} from 'src/application/dtos/favourite-job/res.favourite-job.dto';
import { GetFavouriteJobsQuery } from 'src/application/queries/favourite-job/get-favourite-jobs.query';
import { AddFavouriteJobUseCase } from 'src/application/use-cases/favourite-job/add-favourite-job.usecase';
import { RemoveFavouriteJobUseCase } from 'src/application/use-cases/favourite-job/remove-favourite-job.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestCreateFavouriteJobDto,
  RequestGetFavouriteJobsDto,
} from '../dtos/req.favourite-job.dto';
import {
  ResponseApiFavouriteJobDto,
  ResponseListApiFavouriteJobDto,
} from '../dtos/res.favourite-job.dto';

@Controller({ path: 'favourite-jobs', version: '1' })
@ApiTags('Favourite Jobs')
export class FavouriteJobController extends BaseController {
  constructor(
    private readonly addFavouriteJobUseCase: AddFavouriteJobUseCase,
    private readonly removeFavouriteJobUseCase: RemoveFavouriteJobUseCase,
    private readonly getFavouriteJobsQuery: GetFavouriteJobsQuery,
  ) {
    super(new Logger(FavouriteJobController.name));
  }

  @Post()
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Them mot job vao danh sach yeu thich cua toi. Truy cap: Job Seeker.',
  })
  @ApiResponse({ status: 201, type: ResponseApiFavouriteJobDto })
  async addFavouriteJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestCreateFavouriteJobDto,
  ): Promise<IResponseApiFavouriteJobDto> {
    return await this.addFavouriteJobUseCase.execute(user.id, dto);
  }

  @Delete(':jobId')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Xoa mot job khoi danh sach yeu thich cua toi. Truy cap: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiFavouriteJobDto })
  async removeFavouriteJob(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<IResponseApiFavouriteJobDto> {
    return await this.removeFavouriteJobUseCase.execute(user.id, jobId);
  }

  @Get()
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Lay danh sach job yeu thich cua toi. Truy cap: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseListApiFavouriteJobDto })
  async getFavouriteJobs(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() dto: RequestGetFavouriteJobsDto,
  ): Promise<IResponseListApiFavouriteJobDto> {
    return await this.getFavouriteJobsQuery.execute(user.id, dto);
  }
}
