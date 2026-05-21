import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({
    enum: EUserStatus,
    example: Object.values(EUserStatus).join(' | '),
  })
  status: EUserStatus;

  @ApiProperty({
    enum: EUserRole,
    example: Object.values(EUserRole).join(' | '),
  })
  role: EUserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;
}

export class ResponseApiUserDto extends ApiResponseDto<ResponseUserDto> {
  @ApiProperty({ type: ResponseUserDto })
  declare data: ResponseUserDto;
}

export class ResponseListApiUserDto extends ApiResponseDto<ResponseUserDto[]> {
  @ApiProperty({ type: [ResponseUserDto] })
  declare data: ResponseUserDto[];
}
