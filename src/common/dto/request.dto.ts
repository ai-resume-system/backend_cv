import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { IApiRequestPagination } from '../interface/api-request.interface';

// Pagination DTO
export class RequestPaginationDto implements IApiRequestPagination {
  @ApiPropertyOptional({
    description: 'The current page number',
    example: 1,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number;

  @ApiPropertyOptional({
    description: 'The number of items per page',
    example: 50,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit: number;
}
