export interface PaginatedData<T = any> {
  data: T[];
  total: number;
  limit?: number;
  offset?: number;
}
