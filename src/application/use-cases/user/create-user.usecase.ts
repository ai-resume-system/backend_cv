import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { IRoleRepository } from 'src/domain/repositories/role.repository.interface';
import { CreateUserDto } from 'src/application/dtos/user/req.user.dto';
import * as bcrypt from 'bcrypt';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS.message,
      );
    }

    const role = await this.roleRepository.findByName(dto.role);
    if (!role) {
      throw new ConflictException(ERROR_CODES.ROLE_NOT_FOUND.message);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      role_id: role.id,
      status: EUserStatus.ACTIVE,
    });

    this.logger.log(`User created: ${user.email}`);
    return { id: user.id, email: user.email, role: dto.role };
  }
}
