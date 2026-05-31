import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  IResponseApiCVAnalysisDto,
  IResponseApiCVAnalyzeActionDto,
} from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { GetCVAnalysisQuery } from 'src/application/queries/cv-analysis/get-cv-analysis.query';
import { AnalyzeCVUseCase } from 'src/application/use-cases/cv-analysis/analyze-cv.usecase';
import { BaseController } from 'src/common/base/base.controller';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AuthRequired } from 'src/common/decorators/auth.decorator';
import { AuthCurrentUser } from 'src/common/decorators/current-user.decorator';
import type { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ResponseApiCVAnalysisDto,
  ResponseApiCVAnalyzeActionDto,
} from '../dtos/res.cv-analysis.dto';

@Controller({ path: 'cvs', version: '1' })
@ApiTags('CV Analysis')
export class CVAnalysisController extends BaseController {
  constructor(
    private readonly getCVAnalysisQuery: GetCVAnalysisQuery,
    private readonly analyzeCVUseCase: AnalyzeCVUseCase,
  ) {
    super(new Logger(CVAnalysisController.name));
  }

  @Get(':id/analysis')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Get CV analysis result. Access: Job Seeker.',
  })
  @ApiResponse({ status: 200, type: ResponseApiCVAnalysisDto })
  async getCVAnalysis(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiCVAnalysisDto> {
    return await this.getCVAnalysisQuery.execute(id, user.id);
  }

  @Post(':id/analyze')
  @AuthRequired(EUserRole.JOB_SEEKER)
  @ApiOperation({
    summary: 'Queue a CV analysis job. Access: Job Seeker.',
  })
  @ApiResponse({ status: 201, type: ResponseApiCVAnalyzeActionDto })
  async analyzeCV(
    @AuthCurrentUser() user: ICurrentUser,
    @Param('id') id: string,
  ): Promise<IResponseApiCVAnalyzeActionDto> {
    return await this.analyzeCVUseCase.execute(id, user.id);
  }
}
