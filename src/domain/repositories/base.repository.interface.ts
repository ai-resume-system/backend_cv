export interface IPaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IBaseRepository<T> {
  findAll(page: number, limit: number): Promise<IPaginatedResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
