// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { IResponseApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
// import { BaseUsecase } from 'src/common/base/base.usecase';
// import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
// import { AppException } from 'src/common/exceptions/app.exception';
// import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';

// @Injectable()
// export class GetCVByIdQuery extends BaseUsecase {
//   constructor(
//     @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
//   ) {
//     super(new Logger(GetCVByIdQuery.name));
//   }

//   async execute(id: string, userId: string): Promise<IResponseApiCVDto> {
//     return this.runSafe('[Get CV By Id]:', async () => {
//       const cv = await this.cvRepository.findById(id);
//       if (!cv || cv.userId !== userId) {
//         throw new AppException(ERROR_CODES.CV_NOT_FOUND);
//       }
//       return { data: cv };
//     });
//   }
// }
