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
  find(options?: IFindOptions): Promise<IPaginatedResult<T>>; //tìm tất cả
  findById(id: string): Promise<T | null>; //tìm theo id không có bản ghi đã xóa
  findByIdWithDeleted(id: string): Promise<T | null>; //tìm theo id có bản ghi đã xóa
  create(data: Partial<T>): Promise<T>; //tạo
  update(id: string, data: Partial<T>): Promise<T>; //cập nhật
  delete(id: string): Promise<void>; //xóa cứng
  softDelete(id: string): Promise<void>; //xóa mềm
}
