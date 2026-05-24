import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/response.dto';

export class ResponseAuthDto {
  @ApiProperty()
  accessToken: string;
}

export class ResponseVerifyOtpDto {
  @ApiProperty()
  signKey?: string;
}

export class ResponseApiAuthDto extends ApiResponseDto<ResponseAuthDto> {
  @ApiProperty({ type: ResponseAuthDto })
  declare data: ResponseAuthDto;
}

export class ResponseApiVerifyOtpDto extends ApiResponseDto<ResponseVerifyOtpDto | null> {
  @ApiProperty({
    type: ResponseVerifyOtpDto,
    nullable: true,
  })
  declare data: ResponseVerifyOtpDto | null;
}
