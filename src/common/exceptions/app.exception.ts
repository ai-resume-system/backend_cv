import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppError {
  code: number;
  message: string;
}

export class AppException extends HttpException {
  constructor(error: AppError, statusCode: HttpStatus) {
    super(
      {
        code: error.code,
        message: error.message,
      },
      statusCode,
    );
  }

  getErrorCode(): number {
    const response = this.getResponse();
    return typeof response === 'object' && response !== null
      ? (response as { code: number }).code
      : 0;
  }
}
