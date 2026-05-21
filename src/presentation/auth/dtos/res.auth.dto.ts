import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseAuthDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for renewing access',
    example: 'dGhpc2lzYXJlZnJlc2h0b2tlbg==',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User info after login',
    example: { id: 'uuid', role: EUserRole.JOB_SEEKER },
    required: false,
  })
  user?: {
    id: string;
    role: EUserRole;
  };
}

export class ResponseVerifyOtpDto {
  @ApiProperty({
    description: 'Sign key for forgot password flow',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  signKey?: string;
}

export class ResponseApiAuthDto extends ApiResponseDto<ResponseAuthDto> {
  @ApiProperty({ type: ResponseAuthDto })
  declare data: ResponseAuthDto;
}

export class ResponseApiVerifyOtpDto extends ApiResponseDto<ResponseVerifyOtpDto | null> {
  @ApiProperty({
    description: 'Verify OTP payload',
    type: ResponseVerifyOtpDto,
    nullable: true,
    required: false,
  })
  declare data: ResponseVerifyOtpDto | null;
}
