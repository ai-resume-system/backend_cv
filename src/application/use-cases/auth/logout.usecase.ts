import { Injectable, Logger } from '@nestjs/common';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(private readonly redis: RedisAdapter) {}

  async execute(userId: string): Promise<{ message: string }> {
    await this.redis.removeRefreshToken(userId);
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Đăng xuất thành công' };
  }
}
