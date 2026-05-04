// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
// import { BaseUsecase } from 'src/common/base/base.usecase';
// import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
// import { AppException } from 'src/common/exceptions/app.exception';
// import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
// import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

// const CV_DETAIL_CACHE_TTL_SECONDS = 1800;

// @Injectable()
// export class GetCVByIdQuery extends BaseUsecase {
//   constructor(
//     @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
//     private readonly redis: RedisAdapter,
//   ) {
//     super(new Logger(GetCVByIdQuery.name));
//   }

//   async execute(id: string, userId: string): Promise<IResponseApiCVDto> {
//     return this.runSafe('[Get CV By Id]:', async () => {
//       const cacheKey = `cv:detail:${id}`;
//       const cached = await this.redis.safeGetJson<IResponseApiCVDto>(cacheKey);
//       if (cached && cached.data.userId === userId) return cached;

//       const cv = await this.cvRepository.findById(id);
//       if (!cv || cv.userId !== userId) {
//         throw new AppException(ERROR_CODES.CV_NOT_FOUND);
//       }
//       const response = { data: cv };
//       await this.redis.safeSetJson(cacheKey, response, CV_DETAIL_CACHE_TTL_SECONDS);
//       return response;
//     });
//   }
// }
