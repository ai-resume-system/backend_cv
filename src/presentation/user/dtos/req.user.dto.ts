import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    enum: EUserRole,
    isArray: true,
    description:
      'Filter roles as array or comma separated string. Admin role is always excluded from list results.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  @IsArray()
  @IsEnum(EUserRole, { each: true })
  role?: EUserRole[];

  @ApiPropertyOptional({ enum: EUserStatus })
  @IsOptional()
  @IsEnum(EUserStatus)
  status?: EUserStatus;
}

export class RequestUpdateUserStatusDto {
  @ApiProperty({
    enum: EUserStatus,
    example: Object.values(EUserStatus).join(' | '),
  })
  @IsOptional()
  @IsEnum(EUserStatus)
  status: EUserStatus;
}
