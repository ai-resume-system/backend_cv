import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { EUserRole } from 'src/common/constants/enum/user.enum';

export class RequestCreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: EUserRole.JOB_SEEKER,
  })
  @IsString()
  roleName: string;
}

export class RequestUpdateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: EUserRole.JOB_SEEKER,
  })
  @IsString()
  roleName: string;

  @ApiProperty({
    description: 'Role status',
    example: Object.values(EUserRole).join(' | '),
  })
  @IsEnum(EUserRole)
  status: EUserRole;
}
