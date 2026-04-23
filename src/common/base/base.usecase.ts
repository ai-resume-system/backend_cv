import { HttpException, Logger } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { ERROR_CODES } from '../constants/error-codes.constants';

export class BaseUsecase {
  protected readonly logger: Logger;
  protected constructor(logger?: Logger) {
    this.logger = logger
      ? logger
      : new Logger(BaseUsecase.name, { timestamp: true });
  }

  protected async runSafe<T>(
    context: string,
    fn: () => Promise<T>,
    fallbackError = ERROR_CODES.INTERNAL_SERVER_ERROR,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`[${context}]:`, error);
      throw new AppException(fallbackError);
    }
  }
}
