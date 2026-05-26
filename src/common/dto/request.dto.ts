import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { IApiRequestPagination } from '../interface/api-request.interface';
import { transfomerPagination } from '../utils/request-pagination.utils';

// Pagination DTO
export class RequestPaginationDto implements IApiRequestPagination {
  @ApiPropertyOptional({
    description: 'The current page number',
    example: 1,
    default: 1,
    type: Number,
  })
  @Transform(({ value }) => transfomerPagination(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'The number of items per page',
    example: 50,
    default: 10,
    type: Number,
  })
  @Transform(({ value }) => transfomerPagination(value))
  @IsInt()
  @Min(1)
  limit: number = 10;
}
