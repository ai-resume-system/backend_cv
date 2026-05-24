import { Logger } from '@nestjs/common';
import { BaseUsecase } from './base.usecase';

export class BaseController extends BaseUsecase {
  protected constructor(logger?: Logger) {
    super(
      logger ? logger : new Logger(BaseController.name, { timestamp: true }),
    );
  }
}
