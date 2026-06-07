export interface IPaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
}

export interface ISortOptions {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IFilterOptions {
  q?: string;
  [key: string]: any;
}

export interface IFindOptions {
  filter?: IFilterOptions;
  pagination?: IPaginationOptions;
  sort?: ISortOptions;
}

export interface IBaseRepository<T> {
  find(options?: IFindOptions): Promise<IPaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  findByIdWithDeleted(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
