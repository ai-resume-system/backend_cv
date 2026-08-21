import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export async function invalidateAdminAnalyticsCache(
  redis: RedisAdapter,
): Promise<void> {
  await Promise.all([
    redis.bumpVersion(CACHE_VERSION_KEYS.ADMIN_ANALYTICS_OVERVIEW),
    redis.bumpVersion(CACHE_VERSION_KEYS.ADMIN_ANALYTICS_USER_GROWTH),
    redis.bumpVersion(CACHE_VERSION_KEYS.ADMIN_ANALYTICS_JOB_GROWTH),
    redis.bumpVersion(CACHE_VERSION_KEYS.ADMIN_ANALYTICS_APPLICATION_GROWTH),
    redis.bumpVersion(CACHE_VERSION_KEYS.ADMIN_ANALYTICS_RECENT_ACTIVITIES),
  ]);
}
