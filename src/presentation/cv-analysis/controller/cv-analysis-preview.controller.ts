import {
  Body,
  Controller,
  Logger,
  Post,
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
import type {
  IResponseApiTempCVPreviewDto,
  IResponseApiTempCVSaveDto,
  IResponseApiTempCVUploadDto,
} from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { PreviewTempCVAnalysisUseCase } from 'src/application/use-cases/cv-analysis/preview-temp-cv-analysis.usecase';
import { SaveTempCVAnalysisUseCase } from 'src/application/use-cases/cv-analysis/save-temp-cv-analysis.usecase';
import { UploadTempCVAnalysisUseCase } from 'src/application/use-cases/cv-analysis/upload-temp-cv-analysis.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequestPreviewTempCVAnalysisDto,
  RequestSaveTempCVAnalysisDto,
  RequestUploadTempCVAnalysisDto,
} from '../dtos/req.cv-analysis.dto';
import {
  ResponseApiTempCVPreviewDto,
  ResponseApiTempCVSaveDto,
  ResponseApiTempCVUploadDto,
} from '../dtos/res.cv-analysis.dto';

const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;

@Controller({ path: 'cv-analysis', version: '1' })
@ApiTags('CV Analysis Preview')
export class CVAnalysisPreviewController extends BaseController {
  constructor(
    private readonly uploadTempCVAnalysisUseCase: UploadTempCVAnalysisUseCase,
    private readonly previewTempCVAnalysisUseCase: PreviewTempCVAnalysisUseCase,
    private readonly saveTempCVAnalysisUseCase: SaveTempCVAnalysisUseCase,
  ) {
    super(new Logger(CVAnalysisPreviewController.name));
  }

  @Post('upload-temp')
  @AuthRequired()
  @ApiOperation({
    summary: 'Tai len tam CV de preview AI analysis. Truy cap: User da xac thuc.',
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_FILE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RequestUploadTempCVAnalysisDto })
  @ApiResponse({ status: 201, type: ResponseApiTempCVUploadDto })
  async uploadTemp(
    @UploadedFile() file: Express.Multer.File,
    @AuthCurrentUser() user: ICurrentUser,
  ): Promise<IResponseApiTempCVUploadDto> {
    return await this.uploadTempCVAnalysisUseCase.execute(user.id, file);
  }

  @Post('preview')
  @AuthRequired()
  @ApiOperation({
    summary: 'Preview ket qua phan tich AI cho CV tam. Truy cap: User da xac thuc.',
  })
  @ApiResponse({ status: 201, type: ResponseApiTempCVPreviewDto })
  async preview(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestPreviewTempCVAnalysisDto,
  ): Promise<IResponseApiTempCVPreviewDto> {
    return await this.previewTempCVAnalysisUseCase.execute(user.id, dto);
  }

  @Post('save-preview')
  @AuthRequired()
  @ApiOperation({
    summary: 'Luu preview CV AI thanh CV chinh thuc trong he thong. Truy cap: User da xac thuc.',
  })
  @ApiResponse({ status: 201, type: ResponseApiTempCVSaveDto })
  async savePreview(
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestSaveTempCVAnalysisDto,
  ): Promise<IResponseApiTempCVSaveDto> {
    return await this.saveTempCVAnalysisUseCase.execute(user.id, dto);
  }
}
