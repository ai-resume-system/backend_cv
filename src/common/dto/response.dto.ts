import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import {
  IApiResponse,
  IApiResponsePagination,
} from '../interface/api-response.interface';

export class MetaDto {
  @ApiProperty({
    description: 'Response status',
    example: 'success',
    enum: ['success'],
  })
  status?: 'success';

  @ApiProperty({
    description: 'A message describing the result',
    example: 'Successfully',
    type: String,
  })
  message?: string;
}

// Pagination DTO
export class PaginationDto implements IApiResponsePagination {
  @ApiProperty({
    description: 'The current page number',
    example: 1,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: 50,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit: number;

  @ApiProperty({
    description: 'The total number of items',
    example: 0,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  totalItems: number;

  @ApiProperty({
    description: 'The total number of pages',
    example: 0,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  totalPages: number;
}

export class ApiResponseDto<T> implements IApiResponse<T> {
  @ApiProperty({
    description: 'Response status',
    example: 'success',
    enum: ['success'],
  })
  status?: 'success';

  @ApiProperty({
    description: 'A message describing the result',
    example: 'Successfully',
    type: String,
  })
  message?: string;

  @ApiProperty({
    description:
      'The data payload, which can be an object, array, or specific DTO type',
    type: () => Object,
  })
  data: T;

  @ApiPropertyOptional({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination?: PaginationDto;
}

export class ResponseApiNullDto extends ApiResponseDto<null> {
  @ApiProperty({
    description: 'The data payload for action responses',
    nullable: true,
    example: null,
  })
  declare data: null;
}

export class ResponseBooleanDto {
  @ApiProperty({
    description: 'Indicates successful',
    example: true,
    type: Boolean,
  })
  success: boolean;
}

export class ResponseApiBooleanDto {
  @ApiProperty({
    description: 'Response status',
    example: 'success',
    enum: ['success'],
  })
  status?: 'success';

  @ApiProperty({
    description: 'A message describing the result',
    example: 'Successfully',
    type: String,
  })
  message?: string;

  @ApiProperty({ type: ResponseBooleanDto })
  data: ResponseBooleanDto;
}
