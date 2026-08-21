export interface IApiResponsePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IApiResponse<T> {
  status?: 'success';
  message?: string;
  data: T;
  pagination?: IApiResponsePagination;
}

export interface IApiErrorResponse {
  status: 'error';
  message: string;
}

export interface IResponseApiNullDto extends IApiResponse<null> {}
