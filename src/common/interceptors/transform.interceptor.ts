import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponseMeta } from '../interface/api-response.interface';

export interface IApiResponse<T> {
  meta?: IApiResponseMeta;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (!response) {
          return {
            meta: {
              status: true,
              message: 'Success',
            },
            data: null,
          };
        }

        if (response.meta) {
          return response;
        }

        const hasPagination = 'pagination' in response && response.pagination;

        return {
          meta: {
            status: true,
            message: 'Success',
          },
          data: response.data ?? response,
          ...(hasPagination && { pagination: response.pagination }),
        };
      }),
    );
  }
}
