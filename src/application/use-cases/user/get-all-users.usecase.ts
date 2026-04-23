import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { IRequestGetUsersDto } from 'src/application/dtos/user/req.user.dto';
import type { IGetAllUsersResponseDto } from 'src/application/dtos/user/res.user.dto';

@Injectable()
export class GetAllUsersUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {
    super(new Logger(GetAllUsersUseCase.name));
  }

  async execute(dto: IRequestGetUsersDto): Promise<IGetAllUsersResponseDto> {
    return this.runSafe('[Get Users]:', async () => {
      const { page, limit, role, status } = dto;
      const skip = (page - 1) * limit;

      const result = await this.userRepository.findWithPagination({
        skip,
        take: limit,
        role,
        status,
      });

      const totalPages = Math.ceil(result.total / limit);

      return {
        data: result.data.map((user) => ({
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        total: result.total,
        page,
        limit,
        totalPages,
      };
    });
  }
}
