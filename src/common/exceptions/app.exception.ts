import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '../helpers/response.helper';

export interface AppError {
  message: string;
  status: HttpStatus;
}

export class AppException extends HttpException {
  constructor(error: AppError, statusCode?: HttpStatus) {
    const status =
      statusCode ?? error.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    super(ResponseHelper.error(error.message), status);
  }
}
