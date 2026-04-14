export interface IApiResponseMeta {
  status: boolean;
  message: string;
  extra?: object | null;
}

export interface IApiResponsePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IApiResponse<T> {
  meta?: IApiResponseMeta;
  data: T;
  pagination?: IApiResponsePagination;
}
