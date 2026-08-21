import { CACHE_VERSION_KEYS } from '../constants/cache-keys.constants';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export async function invalidateJobApplicationReadCaches(
  redis: RedisAdapter,
): Promise<void> {
  await Promise.all([
    redis.bumpVersion(CACHE_VERSION_KEYS.JOB_APPLICATION_LIST),
    redis.bumpVersion(CACHE_VERSION_KEYS.JOB_APPLICATION_DETAIL),
  ]);
}
