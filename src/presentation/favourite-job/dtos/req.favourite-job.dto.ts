import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { RequestPaginationDto } from 'src/common/dto/request.dto';

export class RequestCreateFavouriteJobDto {
  @ApiProperty()
  @IsUUID()
  jobId: string;
}

export class RequestGetFavouriteJobsDto extends RequestPaginationDto {
}
