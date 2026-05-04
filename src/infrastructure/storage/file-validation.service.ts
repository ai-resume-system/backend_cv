import { Injectable } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { extname } from 'path';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';

export interface IValidatedFile {
  extension: 'pdf' | 'docx' | 'doc';
  mime: string;
}

const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;
@Injectable()
export class FileValidationService {
  async validateCvFile(file: Express.Multer.File): Promise<IValidatedFile> {
    if (!file || !file.buffer?.length) {
      throw new AppException(ERROR_CODES.VALIDATION_ERROR);
    }

    if (file.size > MAX_CV_FILE_SIZE) {
      throw new AppException(ERROR_CODES.CV_FILE_TOO_LARGE);
    }

    const detected = await fileTypeFromBuffer(file.buffer);
    const extension = detected?.ext?.toLowerCase();
    const mime = detected?.mime || file.mimetype;
    const originalExtension = extname(file.originalname || '')
      .replace('.', '')
      .toLowerCase();
    const requestMime = file.mimetype?.toLowerCase();
    const header = file.buffer.subarray(0, 1024).toString('latin1');
    const isPdfByHeader = header.includes('%PDF-');

    if (originalExtension === 'pdf' && (extension === 'pdf' || isPdfByHeader)) {
      return { extension: 'pdf', mime: 'application/pdf' };
    }

    if (
      originalExtension === 'docx' &&
      extension === 'docx' &&
      (mime ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        requestMime ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      return {
        extension: 'docx',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }

    if (
      originalExtension === 'doc' &&
      (extension === 'cfb' ||
        extension === 'doc' ||
        mime === 'application/x-cfb' ||
        mime === 'application/msword' ||
        requestMime === 'application/msword')
    ) {
      return { extension: 'doc', mime: 'application/msword' };
    }

    throw new AppException(ERROR_CODES.CV_FILE_TYPE_INVALID);
  }
}
