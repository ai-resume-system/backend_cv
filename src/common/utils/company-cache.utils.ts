import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { invalidateUserReadCaches } from './user-cache.utils';

export async function invalidateCompanyReadCaches(
  redis: RedisAdapter,
): Promise<void> {
  await Promise.all([
    redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_LIST),
    redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_DETAIL),
    redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST),
    redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL),
    invalidateUserReadCaches(redis),
  ]);
}
