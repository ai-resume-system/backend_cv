import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { OTP_TTL_10M, OTP_TTL_1M } from 'src/common/constants/ttl.constants';

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
  // OTP
  // =======================
  async setOtp(key: string, otp: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('otp_value', key), otp, 'EX', ttl);
  }

  async getOtp(key: string): Promise<string | null> {
    return this.redis.get(this.buildKey('otp_value', key));
  }

  async increaseOtpFailCount(key: string): Promise<number> {
    const redisKey = this.buildKey('otp_fail_count', key);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, OTP_TTL_10M);
    }
    return count;
  }

  async lock(key: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('otp_lock', key), 'locked', 'EX', ttl);
  }

  async isLocked(key: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('otp_lock', key)));
  }

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
  // OTP RESEND / COOLDOWN
  // =======================
  async setCooldown(key: string, ttl: number): Promise<void> {
    await this.redis.set(this.buildKey('otp_cooldown', key), '1', 'EX', ttl);
  }

  async isCooldown(key: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('otp_cooldown', key)));
  }

  async getResendCount(key: string): Promise<number> {
    const count = await this.redis.get(this.buildKey('otp_resend_count', key));
    return count ? parseInt(count, 10) : 0;
  }

  async increaseResendCount(key: string): Promise<number> {
    const redisKey = this.buildKey('otp_resend_count', key);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, 3600);
    }
    return count;
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

  // =======================
  // REFRESH TOKEN
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

  // =======================
  // IP REQUEST (OTP)
  // =======================
  async getIpRequestCount(ip: string): Promise<number> {
    const count = await this.redis.get(this.buildKey('ip_request', ip));
    return count ? parseInt(count, 10) : 0;
  }

  async increaseIpRequest(ip: string): Promise<number> {
    const redisKey = this.buildKey('ip_request', ip);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, OTP_TTL_1M);
    }
    return count;
  }

  // =======================
  // LOGIN IP
  // =======================
  async increaseLoginFailCountByIp(ip: string): Promise<number> {
    const redisKey = this.buildKey('login_fail_ip', ip);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, OTP_TTL_10M);
    }
    return count;
  }

  async clearLoginFailCountByIp(ip: string): Promise<void> {
    await this.redis.del(this.buildKey('login_fail_ip', ip));
  }

  async lockLoginByIp(ip: string, ttl: number): Promise<void> {
    await this.redis.set(
      this.buildKey('login_lock_ip', ip),
      'locked',
      'EX',
      ttl,
    );
  }

  async isLoginLockedByIp(ip: string): Promise<boolean> {
    return !!(await this.redis.get(this.buildKey('login_lock_ip', ip)));
  }

  async clearLoginLockByIp(ip: string): Promise<void> {
    await this.redis.del(this.buildKey('login_lock_ip', ip));
  }

  // =======================
  // LOGIN EMAIL + IP
  // =======================
  async increaseLoginFailCountEmailAndIp(
    email: string,
    ip: string,
  ): Promise<number> {
    const redisKey = this.buildKey('login_fail_email_ip', `${email}:${ip}`);
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, OTP_TTL_10M);
    }
    return count;
  }

  async clearLoginFailCountEmailAndIp(
    email: string,
    ip: string,
  ): Promise<void> {
    await this.redis.del(
      this.buildKey('login_fail_email_ip', `${email}:${ip}`),
    );
  }

  async lockLoginEmailAndIp(
    email: string,
    ip: string,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(
      this.buildKey('login_lock_email_ip', `${email}:${ip}`),
      'locked',
      'EX',
      ttl,
    );
  }

  async isLoginLockedEmailAndIp(email: string, ip: string): Promise<boolean> {
    return !!(await this.redis.get(
      this.buildKey('login_lock_email_ip', `${email}:${ip}`),
    ));
  }

  async clearLoginLockEmailAndIp(email: string, ip: string): Promise<void> {
    await this.redis.del(
      this.buildKey('login_lock_email_ip', `${email}:${ip}`),
    );
  }
}
