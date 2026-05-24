import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiCvAnalysisClient } from './ai-cv-analysis.client';
import { CVAnalysisNormalizerService } from './cv-analysis-normalizer.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AiCvAnalysisClient, CVAnalysisNormalizerService],
  exports: [AiCvAnalysisClient, CVAnalysisNormalizerService],
})
export class AiAnalysisModule {}
