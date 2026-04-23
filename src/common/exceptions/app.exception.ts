import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppError {
  code: number;
  message: string;
  status: HttpStatus;
}

export class AppException extends HttpException {
  constructor(error: AppError, statusCode?: HttpStatus) {
    const status =
      statusCode ?? error.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    super(
      {
        code: error.code,
        message: error.message,
      },
      status,
    );
  }

  getErrorCode(): number {
    const response = this.getResponse();
    return typeof response === 'object' && response !== null
      ? (response as { code: number }).code
      : 0;
  }
}
