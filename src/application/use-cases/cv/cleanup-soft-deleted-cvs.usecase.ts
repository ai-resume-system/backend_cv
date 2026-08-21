import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobMatchRepository } from 'src/domain/repositories/job-match.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

const CV_CLEANUP_DAYS = 30;

@Injectable()
export class CleanupSoftDeletedCvsUseCase {
  private readonly logger = new Logger(CleanupSoftDeletedCvsUseCase.name);

  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobMatchRepository')
    private readonly jobMatchRepository: IJobMatchRepository,
    private readonly redis: RedisAdapter,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('Starting CV cleanup job...');

    try {
      const before = new Date();
      before.setDate(before.getDate() - CV_CLEANUP_DAYS);

      const cvs = await this.cvRepository.findSoftDeletedBefore(before);

      if (!cvs.length) {
        this.logger.log('No CVs to clean up.');
        return;
      }

      const cvIds = cvs.map((cv) => cv.id);
      this.logger.log(`Found ${cvIds.length} CVs to hard-delete.`);

      await this.jobMatchRepository.deleteByCvIds(cvIds);

      for (const id of cvIds) {
        await this.cvRepository.delete(id);
      }

      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);

      this.logger.log(`Cleanup completed: ${cvIds.length} CVs hard-deleted.`);
    } catch (error) {
      this.logger.error(`CV cleanup job failed: ${error.message}`, error.stack);
    }
  }
}
