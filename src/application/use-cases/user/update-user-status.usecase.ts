import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { IUpdateUserStatusDto } from 'src/application/dtos/user/req.user.dto';

@Injectable()
export class UpdateUserStatusUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {
    super(new Logger(UpdateUserStatusUseCase.name));
  }

  async execute(
    userId: string,
    dto: IUpdateUserStatusDto,
  ): Promise<{ message: string }> {
    return this.runSafe('[Update User Status]:', async () => {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND.message);
      }

      await this.userRepository.updateStatus(userId, dto.status);

      return { message: `Cập nhật trạng thái thành công` };
    });
  }
}
