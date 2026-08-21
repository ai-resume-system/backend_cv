import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export async function invalidateUserReadCaches(
  redis: RedisAdapter,
): Promise<void> {
  await Promise.all([
    redis.bumpVersion(CACHE_VERSION_KEYS.USER_LIST),
    redis.bumpVersion(CACHE_VERSION_KEYS.USER_DETAIL),
  ]);
}
