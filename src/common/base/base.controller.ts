import { Logger } from '@nestjs/common';
import { BaseService } from './base.service';

export class BaseController extends BaseService {
  protected constructor(logger?: Logger) {
    super(
      logger ? logger : new Logger(BaseController.name, { timestamp: true }),
    );
  }
}
