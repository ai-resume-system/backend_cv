import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiCVAnalyzeActionDto } from 'src/application/dtos/cv-analysis/res.cv-analysis.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

const CV_ANALYSIS_ALREADY_PROCESSING_ERROR = {
  code: 2210,
  message: 'CV dang duoc phan tich. Vui long doi job hien tai hoan tat.',
  status: HttpStatus.CONFLICT,
} as const;

const CV_ANALYSIS_FILE_MISSING_ERROR = {
  code: 2211,
  message: 'CV khong co file hop le de thuc hien phan tich.',
  status: HttpStatus.BAD_REQUEST,
} as const;

const CV_ANALYSIS_TRIGGER_FAILED_ERROR = {
  code: 2212,
  message: 'Khong the khoi tao qua trinh phan tich CV.',
  status: HttpStatus.INTERNAL_SERVER_ERROR,
} as const;

@Injectable()
export class AnalyzeCVUseCase extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(AnalyzeCVUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
  ): Promise<IResponseApiCVAnalyzeActionDto> {
    return this.runSafe('[Analyze CV]:', async () => {
      const cv = await this.cvRepository.findById(id);
      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      if (!cv.fileUrl || !cv.fileExtension) {
        throw new AppException(CV_ANALYSIS_FILE_MISSING_ERROR);
      }

      if (cv.processingStatus === EProcessingStatus.PROCESSING) {
        throw new AppException(CV_ANALYSIS_ALREADY_PROCESSING_ERROR);
      }

      const updated = await this.cvRepository.update(id, {
        processingStatus: EProcessingStatus.PROCESSING,
      });

      await this.queueDispatch.dispatchCvParse({
        cvId: updated.id,
        fileKey: cv.fileUrl,
        extension: cv.fileExtension as 'pdf' | 'docx' | 'doc',
      });

      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);

      return {
        data: {
          cvId: updated.id,
          processingStatus: EProcessingStatus.PROCESSING,
          message: 'CV analysis job has been queued successfully',
        },
      };
    }, CV_ANALYSIS_TRIGGER_FAILED_ERROR);
  }
}
