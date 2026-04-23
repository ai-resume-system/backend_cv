import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestGetAllUsersDto extends RequestPaginationDto {
  @ApiPropertyOptional({
    description: 'Search by name, phone, or email',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @IsEnum({ ASC: 'asc', DESC: 'desc' } as const)
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ enum: EUserRole, example: EUserRole.ADMIN })
  @IsOptional()
  @IsEnum(EUserRole)
  role?: EUserRole;

  @ApiPropertyOptional({ enum: EUserStatus, example: EUserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EUserStatus)
  status?: EUserStatus;
}

export class RequestUpdateUserStatusDto {
  @ApiProperty({
    enum: EUserStatus,
    example: Object.values(EUserStatus).join(' | '),
  })
  @IsEnum(EUserStatus)
  status: EUserStatus;
}
