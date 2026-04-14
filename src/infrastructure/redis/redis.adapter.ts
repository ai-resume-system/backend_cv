import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class RedisAdapter extends BaseUsecase {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {
    super(new Logger(RedisAdapter.name));
  }

  // =======================
  // 🔑 KEY BUILDER
  // =======================
  private buildKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  // =======================
  // 🔐 OTP VALUE
  // =======================
  async setOtp(key: string, otp: string, ttl = 300): Promise<void> {
    await this.redis.set(this.buildKey('otp_value', key), otp, 'EX', ttl);
  }

  async getOtp(key: string): Promise<string | null> {
    return this.redis.get(this.buildKey('otp_value', key));
  }

  // =======================
  // ❌ OTP FAIL COUNT (NO BUSINESS LOGIC)
  // =======================
  async increaseOtpFailCount(key: string): Promise<number> {
    const redisKey = this.buildKey('otp_fail_count', key);
    const count = await this.redis.incr(redisKey);

    if (count === 1) {
      await this.redis.expire(redisKey, 600); // 10 phút
    }

    return count;
  }

  async clearOtpFailCount(key: string): Promise<void> {
    await this.redis.del(this.buildKey('otp_fail_count', key));
  }

  // =======================
  // 🔒 LOCK
  // =======================
  async lock(key: string, ttl = 600): Promise<void> {
    await this.redis.set(this.buildKey('otp_lock', key), 'locked', 'EX', ttl);
  }

  async isLocked(key: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('otp_lock', key)));
  }

  async clearLock(key: string): Promise<void> {
    await this.redis.del(this.buildKey('otp_lock', key));
  }

  // =======================
  // ⏱️ COOLDOWN
  // =======================
  async setCooldown(key: string, ttl = 60): Promise<void> {
    await this.redis.set(this.buildKey('otp_cooldown', key), '1', 'EX', ttl);
  }

  async isCooldown(key: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('otp_cooldown', key)));
  }

  // =======================
  // 🔁 RESEND COUNT
  // =======================
  async getResendCount(key: string): Promise<number> {
    const count = await this.redis.get(this.buildKey('otp_resend_count', key));
    return count ? parseInt(count, 10) : 0;
  }

  async increaseResendCount(key: string): Promise<number> {
    const redisKey = this.buildKey('otp_resend_count', key);
    const count = await this.redis.incr(redisKey);

    if (count === 1) {
      await this.redis.expire(redisKey, 3600); // 1 giờ
    }

    return count;
  }

  async clearResendCount(key: string): Promise<void> {
    await this.redis.del(this.buildKey('otp_resend_count', key));
  }

  // =======================
  // 🧹 CLEAR OTP FLOW
  // =======================
  async clearOtpFlow(key: string): Promise<void> {
    await this.redis.del(
      this.buildKey('otp_value', key),
      this.buildKey('otp_fail_count', key),
      this.buildKey('otp_lock', key),
      this.buildKey('otp_cooldown', key),
      this.buildKey('otp_resend_count', key),
    );
  }

  // =======================
  // 👤 TEMP PROFILE
  // =======================
  async setTempProfile(key: string, payload: any, ttl = 300): Promise<void> {
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
  // 🔑 RESET PASSWORD TOKEN
  // =======================
  async setSignKey(key: string, signKey: string, ttl = 600): Promise<void> {
    await this.redis.set(this.buildKey('reset_token', key), signKey, 'EX', ttl);
  }

  async getSignKey(key: string): Promise<string | null> {
    return this.redis.get(this.buildKey('reset_token', key));
  }

  async clearSignKey(key: string): Promise<void> {
    await this.redis.del(this.buildKey('reset_token', key));
  }

  // =======================
  // 🔄 REFRESH TOKEN
  // =======================
  async setRefreshToken(userId: string, token: string, ttl: number) {
    await this.redis.set(
      this.buildKey('refresh_token', userId),
      token,
      'EX',
      ttl,
    );
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redis.get(this.buildKey('refresh_token', userId));
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.redis.del(this.buildKey('refresh_token', userId));
  }
}
