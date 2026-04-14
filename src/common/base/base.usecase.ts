import { Logger } from '@nestjs/common';

export class BaseUsecase {
  protected readonly logger: Logger;
  protected constructor(logger?: Logger) {
    this.logger = logger
      ? logger
      : new Logger(BaseUsecase.name, { timestamp: true });
  }
}
