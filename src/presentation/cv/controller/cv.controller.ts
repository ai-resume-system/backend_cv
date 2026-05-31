import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiCVDownloadDto,
  IResponseApiCVDto,
  IResponseApiCVPreviewDto,
  IResponseListApiCVDto,
} from 'src/application/dtos/cv/res.cv.dto';
import { GetCVsQuery } from 'src/application/queries/cv/get-cvs.query';
import { GetCVDownloadUrlQuery } from 'src/application/queries/cv/get-cv-download-url.query';
import { GetCVPreviewUrlQuery } from 'src/application/queries/cv/get-cv-preview-url.query';
import { DeleteCVUseCase } from 'src/application/use-cases/cv/delete-cv.usecase';
import { UpdateCVUseCase } from 'src/application/use-cases/cv/update-cv.usecase';
import { SetDefaultCVUseCase } from 'src/application/use-cases/cv/set-default-cv.usecase';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { BaseController } from 'src/common/base/base.controller';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { RequestGetCVsDto, RequestUpdateCVDto } from '../dtos/req.cv.dto';
import {
  ResponseApiCVDownloadDto,
  ResponseApiCVPreviewDto,
  ResponseApiCVDto,
  ResponseListApiCVDto,
} from '../dtos/res.cv.dto';

@Controller({ path: 'cvs', version: '1' })
@ApiTags('CVs')
export class CVController extends BaseController {
  constructor(
    private readonly getCVsQuery: GetCVsQuery,
    private readonly getCVDownloadUrlQuery: GetCVDownloadUrlQuery,
    private readonly getCVPreviewUrlQuery: GetCVPreviewUrlQuery,
    private readonly updateCVUseCase: UpdateCVUseCase,
    private readonly deleteCVUseCase: DeleteCVUseCase,
    private readonly setDefaultCVUseCase: SetDefaultCVUseCase,
  ) {
    super(new Logger(CVController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Get my CV list. Access: Job Seeker.',
  })
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiResponse({ status: 200, type: ResponseListApiCVDto })
  async getMyCVs(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetCVsDto,
  ): Promise<IResponseListApiCVDto> {
    return await this.getCVsQuery.execute({
      ...query,
      userId: user.id,
    });
  }

  @Get(':id/download')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Get private CV download URL. Access: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiCVDownloadDto })
  async getDownloadUrl(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiCVDownloadDto> {
    return await this.getCVDownloadUrlQuery.execute(id, user.id);
  }

  @Get(':id/preview')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Get private CV preview metadata. Access: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiCVPreviewDto })
  async getPreviewUrl(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiCVPreviewDto> {
    return await this.getCVPreviewUrlQuery.execute(id, user.id);
  }

  @Patch(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Update CV metadata. Access: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiCVDto })
  async updateCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() dto: RequestUpdateCVDto,
  ): Promise<IResponseApiCVDto> {
    return await this.updateCVUseCase.execute(id, user.id, dto);
  }

  @Patch(':id/default')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Set a CV as default. Access: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiCVDto })
  async setDefaultCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiCVDto> {
    return await this.setDefaultCVUseCase.execute(id, user.id);
  }

  @Delete(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Delete a CV. Access: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiNullDto })
  async deleteCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiNullDto> {
    return await this.deleteCVUseCase.execute(id, user.id);
  }
}
