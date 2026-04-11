import { ApiProperty } from '@nestjs/swagger';

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
}
