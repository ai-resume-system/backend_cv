/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException, AppError } from './app.exception';
import { ERROR_CODES } from '../constants/error-codes.constants';

interface ErrorResponse {
  code: number;
  message: string;
  // timestamp: string;
  // path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof AppException) {
      const errorResponse = exception.getResponse() as AppError;
      const errorBody: ErrorResponse = {
        code: errorResponse.code,
        message: errorResponse.message,
        // timestamp,
        // path,
      };

      this.logger.warn(
        `[Business Error] ${errorResponse.code} - ${errorResponse.message} | Path: ${path}`,
      );

      const status = exception.getStatus();
      res.status(status).json(errorBody);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message: string }).message ||
            ERROR_CODES.VALIDATION_ERROR.message;

      const errorBody: ErrorResponse = {
        code: status,
        message,
        // timestamp,
        // path,
      };

      this.logger.warn(`[HTTP Error] ${status} - ${message} | Path: ${path}`);

      res.status(status).json(errorBody);
      return;
    }

    this.logger.error(
      `[System Error] ${(exception as Error).message} | Stack: ${(exception as Error).stack} | Path: ${path}`,
    );

    const errorBody: ErrorResponse = {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
      message: ERROR_CODES.INTERNAL_SERVER_ERROR.message,
      // timestamp,
      // path,
    };

    res.status(500).json(errorBody);
  }
}
