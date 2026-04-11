import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { RequestCreateRoleDto } from 'src/application/dtos/role/req.role.dto';

@Controller('roles')
export class RolesController {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: any,
  ) {}

  @Post()
  create(@Body() dto: RequestCreateRoleDto) {
    return this.roleRepository.create(dto);
  }

  @Get()
  findAll() {
    return this.roleRepository.findAll();
  }
}
