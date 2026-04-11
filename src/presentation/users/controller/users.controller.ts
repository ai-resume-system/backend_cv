import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  Inject,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
} from 'src/application/dtos/user/req.user.dto';
import { CreateUserUseCase } from 'src/application/use-cases/user/create-user.usecase';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userRepository.findAll(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRepository.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userRepository.update(id, dto as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRepository.softDelete(id);
  }
}
