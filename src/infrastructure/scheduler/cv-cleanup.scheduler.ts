import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanupSoftDeletedCvsUseCase } from 'src/application/use-cases/cv/cleanup-soft-deleted-cvs.usecase';

@Injectable()
export class CVCleanupScheduler {
  constructor(
    private readonly cleanupSoftDeletedCvsUseCase: CleanupSoftDeletedCvsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handle(): Promise<void> {
    await this.cleanupSoftDeletedCvsUseCase.execute();
  }
}
