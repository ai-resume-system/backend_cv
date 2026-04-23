import { Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class LogoutUseCase extends BaseUsecase {
  constructor(private readonly redis: RedisAdapter) {
    super(new Logger(LogoutUseCase.name));
  }

  async execute(userId: string): Promise<{ message: string }> {
    return this.runSafe('[Logout]:', async () => {
      await this.redis.removeRefreshToken(userId);
      return { message: 'Đăng xuất thành công' };
    });
  }
}
