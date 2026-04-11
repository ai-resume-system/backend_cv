import { Logger } from '@nestjs/common';

export class BaseService {
  protected readonly logger: Logger;
  protected constructor(logger?: Logger) {
    this.logger = logger
      ? logger
      : new Logger(BaseService.name, { timestamp: true });
  }
}
