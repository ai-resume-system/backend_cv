import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import {
  IApiResponse,
  IApiResponseMeta,
  IApiResponsePagination,
} from '../interface/api-response.interface';

// Meta DTO
export class MetaDto implements IApiResponseMeta {
  @ApiProperty({
    description: 'Indicates the success or failure of the request',
    example: true,
    type: Boolean,
  })
  status: boolean;

  @ApiProperty({
    description: 'A message describing the result',
    example: 'Success',
    type: String,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional metadata, if any',
    example: null,
    nullable: true,
    type: Object,
  })
  extra?: object | null;
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

export class ResponseBooleanDto {
  @ApiProperty({
    description: 'Indicates successful',
    example: true,
    type: Boolean,
  })
  success: boolean;
}

export class ApiResponseBooleanDto {
  @ApiProperty({ type: ResponseBooleanDto })
  data: ResponseBooleanDto;
}
