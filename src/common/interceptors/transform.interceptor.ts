import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IApiErrorResponse,
  IApiResponse,
  IApiResponsePagination,
} from '../interface/api-response.interface';
import { ResponseHelper } from '../helpers/response.helper';

interface ResponseCandidate<T> {
  status?: 'success' | 'error';
  message?: string;
  data?: T;
  pagination?: IApiResponsePagination;
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
        if (
          response &&
          typeof response === 'object' &&
          'status' in response &&
          ((response as ResponseCandidate<T>).status === 'success' ||
            (response as IApiErrorResponse).status === 'error')
        ) {
          return response as IApiResponse<T>;
        }

        if (!response) {
          return ResponseHelper.success(null);
        }

        if (typeof response !== 'object') {
          return ResponseHelper.success(response);
        }

        const candidate = response as ResponseCandidate<T>;
        const hasPagination =
          'pagination' in candidate && candidate.pagination !== undefined;
        const data =
          'data' in candidate
            ? this.normalizeDataPayload(candidate.data)
            : this.normalizeDataPayload(response);

        if (hasPagination) {
          return ResponseHelper.successList(
            Array.isArray(data) ? data : [],
            candidate.pagination!,
            'Successfully',
          );
        }

        return ResponseHelper.success(data, 'Successfully');
      }),
    );
  }

  private normalizeDataPayload<TData>(data: TData): TData | null {
    if (data === undefined) {
      return null;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return data;
    }

    const candidate = data as Record<string, unknown>;
    if ('message' in candidate) {
      const rest = { ...candidate };
      delete rest.message;

      if (Object.keys(rest).length === 0) {
        return null;
      }

      return rest as TData;
    }

    return data;
  }
}
