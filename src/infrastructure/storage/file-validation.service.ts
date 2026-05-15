import { Injectable } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { extname } from 'path';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';

export interface IValidatedFile {
  extension: 'pdf' | 'docx' | 'doc';
  mime: string;
}

export interface IValidatedImageFile {
  extension: 'jpg' | 'jpeg' | 'png' | 'webp';
  mime: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
@Injectable()
export class FileValidationService {
  async validateCvFile(file: Express.Multer.File): Promise<IValidatedFile> {
    if (!file || !file.buffer?.length) {
      throw new AppException(ERROR_CODES.VALIDATION_ERROR);
    }

    if (file.size > MAX_FILE_SIZE) {
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

  async validateImageFile(
    file: Express.Multer.File,
  ): Promise<IValidatedImageFile> {
    if (!file || !file.buffer?.length) {
      throw new AppException(ERROR_CODES.MEDIA_FILE_REQUIRED);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppException(ERROR_CODES.MEDIA_FILE_TOO_LARGE);
    }

    const detected = await fileTypeFromBuffer(file.buffer);
    const detectedExtension = detected?.ext?.toLowerCase();
    const detectedMime = detected?.mime?.toLowerCase();
    const originalExtension = extname(file.originalname || '')
      .replace('.', '')
      .toLowerCase();

    const isAllowedImage =
      detectedMime &&
      ['image/jpeg', 'image/png', 'image/webp'].includes(detectedMime) &&
      ['jpg', 'jpeg', 'png', 'webp'].includes(originalExtension) &&
      ['jpg', 'jpeg', 'png', 'webp'].includes(detectedExtension || '');

    if (!isAllowedImage) {
      throw new AppException(ERROR_CODES.MEDIA_FILE_TYPE_INVALID);
    }

    if (detectedMime === 'image/jpeg') {
      return {
        extension: originalExtension === 'jpg' ? 'jpg' : 'jpeg',
        mime: 'image/jpeg',
      };
    }

    return {
      extension: detectedExtension as 'png' | 'webp',
      mime: detectedMime,
    };
  }
}
