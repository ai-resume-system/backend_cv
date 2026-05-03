import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserByIdQuery } from 'src/application/queries/user/get-user-by-id.query';
import { GetUsersQuery } from 'src/application/queries/user/get-users.query';
import { UpdateUserStatusUseCase } from 'src/application/use-cases/user/update-user-status.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestGetAllUsersDto,
  RequestUpdateUserStatusDto,
} from '../dtos/req.user.dto';
import {
  ResponseApiArrayUserDto,
  ResponseApiUserDto,
} from '../dtos/res.user.dto';

@Controller({ path: 'users', version: '1' })
@ApiTags('Users')
export class UserController extends BaseController {
  constructor(
    private readonly getUsersQuery: GetUsersQuery,
    private readonly getUserByIdQuery: GetUserByIdQuery,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
  ) {
    super(new Logger(UserController.name));
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @AuthRequired(EUserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Get all users successfully',
    type: ResponseApiArrayUserDto,
  })
  async getAllUsers(
    @Query() dto: RequestGetAllUsersDto,
  ): Promise<ResponseApiArrayUserDto> {
    return await this.getUsersQuery.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @AuthRequired(EUserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Get user successfully',
    type: ResponseApiUserDto,
  })
  async getUserById(@Param('id') id: string) {
    return await this.getUserByIdQuery.execute(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status (lock/unlock)' })
  @AuthRequired(EUserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: ResponseApiUserDto,
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: RequestUpdateUserStatusDto,
  ) {
    return await this.updateUserStatusUseCase.execute(id, dto);
  }
}
