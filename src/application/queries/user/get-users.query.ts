import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetUsersDto } from 'src/application/dtos/user/req.user.dto';
import type { IResponseListApiUserDto } from 'src/application/dtos/user/res.user.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

@Injectable()
export class GetUsersQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {
    super(new Logger(GetUsersQuery.name));
  }

  async execute(dto: IRequestGetUsersDto): Promise<IResponseListApiUserDto> {
    return this.runSafe('[Get Users]:', async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        q,
        role,
        status,
      } = dto;
      const result = await this.userRepository.find({
        pagination: { page, limit },
        filter: { q, role, status },
        sort: { sortBy, sortOrder },
      });
      return {
        data: result.data,
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };

      // const skip = (page - 1) * limit;

      // const result = await this.userRepository.findWithPagination({
      //   skip,
      //   take: limit,
      //   role,
      //   status,
      // });

      // const totalPages = Math.ceil(result.total / limit);

      // return {
      //   data: result.data.map((user) => ({
      //     id: user.id,
      //     email: user.email,
      //     phone: user.phone,
      //     role: user.role,
      //     status: user.status,
      //     createdAt: user.createdAt,
      //     updatedAt: user.updatedAt,
      //   })),
      //   total: result.total,
      //   page,
      //   limit,
      //   totalPages,
      // };
    });
  }
}
