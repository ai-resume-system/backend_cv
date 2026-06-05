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
import { UploadFileUseCase } from 'src/application/use-cases/upload/upload-file.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestUploadFileDto } from '../dtos/req.upload.dto';
import { IResponseApiUploadDto } from 'src/application/dtos/upload/res.upload.dto';
import { ResponseApiUploadFileDto } from '../dtos/res.upload.dto';

const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;

@Controller({ path: 'uploads', version: '1' })
@ApiTags('Uploads')
export class UploadController extends BaseController {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {
    super(new Logger(UploadController.name));
  }

  @Post()
  @AuthRequired()
  @ApiOperation({
    summary:
      'Tai len CV, avatar, logo hoac banner vao kho rieng tu. Truy cap: Nguoi dung da xac thuc.',
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_FILE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RequestUploadFileDto })
  @ApiResponse({ status: 201, type: ResponseApiUploadFileDto })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @AuthCurrentUser() user: ICurrentUser,
    @Body() dto: RequestUploadFileDto,
  ): Promise<IResponseApiUploadDto> {
    return await this.uploadFileUseCase.execute(user.id, {
      ...dto,
      file,
    });
  }
}
