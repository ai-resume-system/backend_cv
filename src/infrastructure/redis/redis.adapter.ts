import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { TTL_10M, TTL_1M } from 'src/common/constants/ttl.constants';

@Injectable()
export class RedisAdapter extends BaseUsecase {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {
    super(new Logger(RedisAdapter.name));
  }

  private buildKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  // =======================
  // GENERIC CACHE OPERATIONS
  // =======================
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<void> {
    await this.redis.del(...keys);
  }

  async safeGet(key: string): Promise<string | null> {
    try {
      return await this.get(key);
    } catch (error) {
      this.logger.warn(`Redis get failed for ${key}: ${error.message}`);
      return null;
    }
  }

  async safeSet(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Redis set failed for ${key}: ${error.message}`);
    }
  }

  async safeDel(...keys: string[]): Promise<void> {
    try {
      if (keys.length) await this.del(...keys);
    } catch (error) {
      this.logger.warn(`Redis del failed: ${error.message}`);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async scanByPrefix(prefix: string, count = 100): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, batch] = await this.redis.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        count,
      );
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');
    return keys;
  }

  async safeDeleteByPrefix(prefix: string): Promise<void> {
    try {
      const keys = await this.scanByPrefix(prefix);
      if (keys.length) await this.redis.del(...keys);
    } catch (error) {
      this.logger.warn(
        `Redis prefix delete failed for ${prefix}: ${error.message}`,
      );
    }
  }

  async incrWithExpiry(key: string, ttl: number): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, ttl);
    }
    return count;
  }

  async setWithExpiry(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  // =======================
  // JOB CACHE
  // =======================
  async setJobListCache(
    key: string,
    data: any,
    ttl: number = 600,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('job:list', key),
      JSON.stringify(data),
      'EX',
      ttl,
    );
  }

  async getJobListCache(key: string): Promise<any | null> {
    const data = await this.redis.get(this.buildKey('job:list', key));
    return data ? JSON.parse(data) : null;
  }

  async invalidateJobListCache(): Promise<void> {
    await this.safeDeleteByPrefix('job:list:');
  }

  async setJobDetailCache(
    id: string,
    data: any,
    ttl: number = 1800,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('job:detail', id),
      JSON.stringify(data),
      'EX',
      ttl,
    );
  }

  async getJobDetailCache(id: string): Promise<any | null> {
    const data = await this.redis.get(this.buildKey('job:detail', id));
    return data ? JSON.parse(data) : null;
  }

  async invalidateJobDetailCache(id: string): Promise<void> {
    await this.redis.del(this.buildKey('job:detail', id));
  }

  // =======================
  // CV CACHE
  // =======================
  async setCvListCache(
    key: string,
    data: any,
    ttl: number = 600,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('cv:list', key),
      JSON.stringify(data),
      'EX',
      ttl,
    );
  }

  async getCvListCache(key: string): Promise<any | null> {
    const data = await this.redis.get(this.buildKey('cv:list', key));
    return data ? JSON.parse(data) : null;
  }

  async invalidateCvListCache(): Promise<void> {
    await this.safeDeleteByPrefix('cv:list:');
  }

  // =======================
  // USER PROFILE CACHE
  // =======================
  async setUserProfileCache(
    userId: string,
    data: any,
    ttl: number = 900,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('user:profile', userId),
      JSON.stringify(data),
      'EX',
      ttl,
    );
  }

  async getUserProfileCache(userId: string): Promise<any | null> {
    const data = await this.redis.get(this.buildKey('user:profile', userId));
    return data ? JSON.parse(data) : null;
  }

  async invalidateUserProfileCache(userId: string): Promise<void> {
    await this.redis.del(this.buildKey('user:profile', userId));
  }

  // =======================
  // RATE LIMIT - OTP
  // =======================
  async getResendCount(email: string): Promise<number> {
    const count = await this.redis.get(this.buildKey('rate:otp:resend', email));
    return count ? parseInt(count, 10) : 0;
  }

  async increaseResendCount(email: string): Promise<number> {
    const redisKey = this.buildKey('rate:otp:resend', email);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, 3600);
    }
    return count;
  }

  async clearResendCount(email: string): Promise<void> {
    await this.redis.del(this.buildKey('rate:otp:resend', email));
  }

  async setCooldown(email: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('cooldown', email), '1', 'EX', ttl);
  }

  async isCooldown(email: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('cooldown', email)));
  }

  // =======================
  // RATE LIMIT - IP
  // =======================
  async getIpRequestCount(ip: string): Promise<number> {
    const count = await this.redis.get(this.buildKey('rate:ip:request', ip));
    return count ? parseInt(count, 10) : 0;
  }

  async increaseIpRequest(ip: string): Promise<number> {
    const redisKey = this.buildKey('rate:ip:request', ip);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, TTL_1M);
    }
    return count;
  }

  // =======================
  // ACCOUNT LOCKS
  // =======================
  async lockAccount(userId: string, ttl: number): Promise<void> {
    await this.redis.set(
      this.buildKey('lock:account', userId),
      'locked',
      'EX',
      ttl,
    );
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('lock:account', userId)));
  }

  async unlockAccount(userId: string): Promise<void> {
    await this.redis.del(this.buildKey('lock:account', userId));
  }

  async lockOtp(email: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('lock:otp', email), 'locked', 'EX', ttl);
  }

  async isOtpLocked(email: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('lock:otp', email)));
  }

  async unlockOtp(email: string): Promise<void> {
    await this.redis.del(this.buildKey('lock:otp', email));
  }

  // =======================
  // RATE LIMIT - LOGIN
  // =======================
  async increaseLoginFailCountByIp(ip: string): Promise<number> {
    const redisKey = this.buildKey('rate:login:ip', ip);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, TTL_10M);
    }
    return count;
  }

  async clearLoginFailCountByIp(ip: string): Promise<void> {
    await this.redis.del(this.buildKey('rate:login:ip', ip));
  }

  async lockLoginByIp(ip: string, ttl: number): Promise<void> {
    await this.redis.set(
      this.buildKey('lock:login:ip', ip),
      'locked',
      'EX',
      ttl,
    );
  }

  async isLoginLockedByIp(ip: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('lock:login:ip', ip)));
  }

  async clearLoginLockByIp(ip: string): Promise<void> {
    await this.redis.del(this.buildKey('lock:login:ip', ip));
  }

  async increaseLoginFailCountEmailAndIp(
    email: string,
    ip: string,
  ): Promise<number> {
    const redisKey = this.buildKey('rate:login:email:ip', `${email}:${ip}`);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, TTL_10M);
    }
    return count;
  }

  async clearLoginFailCountEmailAndIp(
    email: string,
    ip: string,
  ): Promise<void> {
    await this.redis.del(
      this.buildKey('rate:login:email:ip', `${email}:${ip}`),
    );
  }

  async lockLoginEmailAndIp(
    email: string,
    ip: string,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('lock:login:email:ip', `${email}:${ip}`),
      'locked',
      'EX',
      ttl,
    );
  }

  async isLoginLockedEmailAndIp(email: string, ip: string): Promise<boolean> {
    return !!(await this.redis.get(
      this.buildKey('lock:login:email:ip', `${email}:${ip}`),
    ));
  }

  async clearLoginLockEmailAndIp(email: string, ip: string): Promise<void> {
    await this.redis.del(
      this.buildKey('lock:login:email:ip', `${email}:${ip}`),
    );
  }

  // =======================
  // OTP CACHE (SHORT TTL)
  // =======================
  async setOtpCache(email: string, otp: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('otp:cache', email), otp, 'EX', ttl);
  }

  async getOtpCache(email: string): Promise<string | null> {
    return this.redis.get(this.buildKey('otp:cache', email));
  }

  async deleteOtpCache(email: string): Promise<void> {
    await this.redis.del(this.buildKey('otp:cache', email));
  }

  async increaseOtpFailCount(email: string): Promise<number> {
    const redisKey = this.buildKey('otp:fail', email);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, TTL_10M);
    }
    return count;
  }

  async clearOtpFailCount(email: string): Promise<void> {
    await this.redis.del(this.buildKey('otp:fail', email));
  }

  // =======================
  // REFRESH TOKEN CACHE (SHORT TTL)
  // =======================
  async setRefreshTokenCache(
    tokenHash: string,
    data: any,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('rt:cache', tokenHash),
      JSON.stringify(data),
      'EX',
      ttl,
    );
  }

  async getRefreshTokenCache(tokenHash: string): Promise<any | null> {
    const data = await this.redis.get(this.buildKey('rt:cache', tokenHash));
    return data ? JSON.parse(data) : null;
  }

  async deleteRefreshTokenCache(tokenHash: string): Promise<void> {
    await this.redis.del(this.buildKey('rt:cache', tokenHash));
  }

  async deleteAllRefreshTokenCacheByUserId(userId: string): Promise<void> {
    try {
      const keys = await this.scanByPrefix(this.buildKey('rt:cache', ''));
      const userKeys: string[] = [];
      for (const key of keys) {
        const value = await this.redis.get(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        if (parsed.userId === userId || parsed.id === userId) {
          userKeys.push(key);
        }
      }
      await this.safeDel(...userKeys);
    } catch (error) {
      this.logger.warn(
        `Redis delete refresh token cache by user failed: ${error.message}`,
      );
    }
  }

  // =======================
  // TEMP PROFILE
  // =======================
  async setTempProfile(key: string, payload: any, ttl: number): Promise<void> {
    await this.redis.set(
      this.buildKey('temp_profile', key),
      JSON.stringify(payload),
      'EX',
      ttl,
    );
  }

  async getTempProfile(key: string): Promise<any | null> {
    const data = await this.redis.get(this.buildKey('temp_profile', key));
    return data ? JSON.parse(data) : null;
  }

  async clearTempProfile(key: string): Promise<void> {
    await this.redis.del(this.buildKey('temp_profile', key));
  }

  // =======================
  // RESET PASSWORD TOKEN
  // =======================
  async setSignKey(key: string, signKey: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('reset_token', key), signKey, 'EX', ttl);
  }

  async getSignKey(key: string): Promise<string | null> {
    return this.redis.get(this.buildKey('reset_token', key));
  }

  async clearSignKey(key: string): Promise<void> {
    await this.redis.del(this.buildKey('reset_token', key));
  }
}
