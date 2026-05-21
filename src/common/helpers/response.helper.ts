export interface ResponsePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export class ResponseHelper {
  static success<T>(data: T, message = 'Successfully') {
    return {
      status: 'success' as const,
      message,
      data,
    };
  }

  static successList<T>(
    data: T[],
    pagination: ResponsePagination,
    message = 'Successfully',
  ) {
    return {
      status: 'success' as const,
      message,
      data,
      pagination,
    };
  }

  static error(message: string) {
    return {
      status: 'error' as const,
      message,
    };
  }
}
