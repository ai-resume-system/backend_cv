/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AppException } from './app.exception';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { ResponseHelper } from '../helpers/response.helper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    if (exception instanceof AppException) {
      const errorResponse = exception.getResponse() as {
        status: 'error';
        message: string;
      };

      this.logger.warn(
        `[Business Error] ${exception.getStatus()} - ${errorResponse.message} | Path: ${path}`,
      );

      res.status(exception.getStatus()).json(errorResponse);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const rawMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string | string[] }).message ||
            ERROR_CODES.VALIDATION_ERROR.message;
      const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;

      this.logger.warn(`[HTTP Error] ${status} - ${message} | Path: ${path}`);

      res.status(status).json(ResponseHelper.error(message));
      return;
    }

    this.logger.error(
      `[System Error] ${(exception as Error).message} | Stack: ${(exception as Error).stack} | Path: ${path}`,
    );

    res
      .status(500)
      .json(ResponseHelper.error(ERROR_CODES.INTERNAL_SERVER_ERROR.message));
  }
}
