import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { MetaDto } from 'src/common/dto/response.dto';

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

export class ResponseApiAuthDto {
  @ApiProperty({ type: MetaDto })
  meta?: MetaDto;

  @ApiProperty({ type: ResponseAuthDto })
  data: ResponseAuthDto;
}
