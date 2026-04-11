import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BaseService } from 'src/common/base/base.service';

@Injectable()
export class RedisAdapter {
  private readonly logger = new Logger(RedisAdapter.name);
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async setOtp(key: string, otp: string, ttl: number = 300): Promise<void> {
    await this.redis.set(`otp_value:${key}`, otp, 'EX', ttl);
  }

  async getOtp(key: string): Promise<string | null> {
    return this.redis.get(`otp_value:${key}`);
  }

  async handleOTPCountFailed(key: string): Promise<number> {
    const redisKey = `otp_fail_count:${key}`;
    const count = await this.redis.incr(redisKey);
    if (count === 1) await this.redis.expire(redisKey, 600);

    if (count > 6) await this.redis.set(`otp_lock:${key}`, 'locked', 'EX', 600);

    return count;
  }

  async isLocked(key: string): Promise<boolean> {
    return !!(await this.redis.get(`otp_lock:${key}`));
  }

  async clearOtp(key: string) {
    await this.redis.del(
      `otp_fail_count:${key}`,
      `otp_lock:${key}`,
      `otp_value:${key}`,
    );
  }

  async setRefreshToken(
    userId: string,
    token: string,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(`refresh_token:${userId}`, token, 'EX', ttl);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redis.get(`refresh_token:${userId}`);
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }
}
