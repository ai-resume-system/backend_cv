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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCVsQuery } from 'src/application/queries/cv/get-cvs.query';
// import { GetCVByIdQuery } from 'src/application/queries/cv/get-cv-by-id.query';
import { GetCVDownloadUrlQuery } from 'src/application/queries/cv/get-cv-download-url.query';
import { GetCVPreviewUrlQuery } from 'src/application/queries/cv/get-cv-preview-url.query';
import { CreateCVUseCase } from 'src/application/use-cases/cv/create-cv.usecase';
import { DeleteCVUseCase } from 'src/application/use-cases/cv/delete-cv.usecase';
import { UpdateCVUseCase } from 'src/application/use-cases/cv/update-cv.usecase';
import { SetDefaultCVUseCase } from 'src/application/use-cases/cv/set-default-cv.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestCreateCVDto,
  RequestGetCVsDto,
  RequestUpdateCVDto,
} from '../dtos/req.cv.dto';
import {
  ResponseApiCVDownloadDto,
  ResponseApiCVPreviewDto,
  ResponseApiCVDto,
  ResponseListApiCVDto,
} from '../dtos/res.cv.dto';

const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;

@Controller({ path: 'cvs', version: '1' })
@ApiTags('CVs')
export class CVController extends BaseController {
  constructor(
    private readonly getCVsQuery: GetCVsQuery,
    private readonly createCVUseCase: CreateCVUseCase,
    // private readonly getCVByIdQuery: GetCVByIdQuery,
    private readonly getCVDownloadUrlQuery: GetCVDownloadUrlQuery,
    private readonly getCVPreviewUrlQuery: GetCVPreviewUrlQuery,
    private readonly updateCVUseCase: UpdateCVUseCase,
    private readonly deleteCVUseCase: DeleteCVUseCase,
    private readonly setDefaultCVUseCase: SetDefaultCVUseCase,
  ) {
    super(new Logger(CVController.name));
  }

  @Get()
  @ApiOperation({ summary: 'Get my CV list' })
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiResponse({ status: 200, type: ResponseListApiCVDto })
  async getMyCVs(
    @AuthCurrentUser() user: ICurrentUser,
    @Query() query: RequestGetCVsDto,
  ): Promise<ResponseListApiCVDto> {
    return this.getCVsQuery.execute({ ...query, userId: user.id });
  }

  @Get(':id/download')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Get private CV download URL' })
  @ApiResponse({ status: 200, type: ResponseApiCVDownloadDto })
  async getDownloadUrl(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<ResponseApiCVDownloadDto> {
    return this.getCVDownloadUrlQuery.execute(id, user.id);
  }

  @Get(':id/preview')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Get CV metadata' })
  @ApiResponse({ status: 200, type: ResponseApiCVPreviewDto })
  async getPreviewUrl(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<ResponseApiCVPreviewDto> {
    return this.getCVPreviewUrlQuery.execute(id, user.id);
  }

  // @Get(':id')
  // @AuthRequired(EUserRole.JOB_SEEKER)
  // @ApiOperation({ summary: 'Get CV metadata' })
  // @ApiResponse({ status: 200, type: ResponseApiCVDto })
  // async getCVById(
  //   @AuthCurrentUser() user: ICurrentUser,
  //   @Param('id') id: string,
  // ): Promise<ResponseApiCVDto> {
  //   return this.getCVByIdQuery.execute(id, user.id);
  // }

  @Post()
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Upload CV' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_CV_FILE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RequestCreateCVDto })
  @ApiResponse({ status: 201, type: ResponseApiCVDto })
  async createCV(
    @UploadedFile() file: Express.Multer.File,
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestCreateCVDto,
  ): Promise<ResponseApiCVDto> {
    return this.createCVUseCase.execute(user.id, { ...dto, file });
  }

  @Patch(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_CV_FILE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update CV metadata or replace file' })
  @ApiResponse({ status: 200, type: ResponseApiCVDto })
  async updateCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() dto: RequestUpdateCVDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseApiCVDto> {
    return this.updateCVUseCase.execute(id, user.id, { ...dto, file });
  }

  @Delete(':id')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Delete CV' })
  async deleteCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return this.deleteCVUseCase.execute(id, user.id);
  }

  @Patch(':id/default')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({ summary: 'Set CV as default' })
  @ApiResponse({ status: 200, type: ResponseApiCVDto })
  async setDefaultCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<{ data: any }> {
    return this.setDefaultCVUseCase.execute(id, user.id);
  }
}
