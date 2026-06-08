import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

const ACCOUNT_PROFILE_PREFIX = 'account:profile:';

export async function invalidateAccountProfileCache(
  redis: RedisAdapter,
  userId: string,
): Promise<void> {
  await redis.safeDel(`${ACCOUNT_PROFILE_PREFIX}${userId}`);
}

export async function invalidateAllAccountProfileCaches(
  redis: RedisAdapter,
): Promise<void> {
  await redis.safeDeleteByPrefix(ACCOUNT_PROFILE_PREFIX);
}
