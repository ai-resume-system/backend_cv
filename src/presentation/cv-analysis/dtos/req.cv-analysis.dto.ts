import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RequestUploadTempCVAnalysisDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}

export class RequestPreviewTempCVAnalysisDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  tempFileKey: string;

  @ApiPropertyOptional({
    enum: ['groq', 'gemini', 'glm'],
  })
  @IsOptional()
  @IsIn(['groq', 'gemini', 'glm'])
  requestedProvider?: 'groq' | 'gemini' | 'glm';
}

export class RequestSaveTempCVAnalysisDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  tempFileKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}
