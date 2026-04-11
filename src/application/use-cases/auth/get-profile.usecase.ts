import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { ResponseUserDto } from 'src/application/dtos/user/res.user.dto';

@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user) {
      throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND.message);
    }

    this.logger.log(`Profile retrieved for user: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      phone: user.phone || '',
      role_id: user.role_id,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
