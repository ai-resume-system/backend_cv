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
import type { IGetUserByIdResponseDto } from 'src/application/dtos/user/res.user.dto';
import { GetUserByIdQuery } from 'src/application/queries/user/get-user-by-id.query';
import { GetUsersQuery } from 'src/application/queries/user/get-users.query';
import { UpdateUserStatusUseCase } from 'src/application/use-cases/user/update-user-status.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { ResponseApiNullDto } from 'src/common/dto/response.dto';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import {
  RequestGetAllUsersDto,
  RequestUpdateUserStatusDto,
} from '../dtos/req.user.dto';
import {
  ResponseApiUserDto,
  ResponseListApiUserDto,
} from '../dtos/res.user.dto';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';

@Controller({ path: 'admin/users', version: '1' })
@ApiTags('Users - Admin')
export class UserController extends BaseController {
  constructor(
    private readonly getUsersQuery: GetUsersQuery,
    private readonly getUserByIdQuery: GetUserByIdQuery,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
  ) {
    super(new Logger(UserController.name));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination and filters. Access: Admin.',
  })
  @AuthRequired(EUserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Get all users successfully',
    type: ResponseListApiUserDto,
  })
  async getAllUsers(
    @Query() dto: RequestGetAllUsersDto,
  ): Promise<ResponseListApiUserDto> {
    return await this.getUsersQuery.execute(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user detail by id. Access: Admin.',
  })
  @AuthRequired(EUserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Get user successfully',
    type: ResponseApiUserDto,
  })
  async getUserById(@Param('id') id: string): Promise<IGetUserByIdResponseDto> {
    return await this.getUserByIdQuery.execute(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update user status such as lock or unlock. Access: Admin.',
  })
  @AuthRequired(EUserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: ResponseApiNullDto,
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: RequestUpdateUserStatusDto,
  ): Promise<IResponseApiNullDto> {
    return await this.updateUserStatusUseCase.execute(id, dto);
  }
}
