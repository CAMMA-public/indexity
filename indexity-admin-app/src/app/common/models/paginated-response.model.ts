export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
