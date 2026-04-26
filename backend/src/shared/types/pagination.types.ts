// path: backend/src/shared/types/pagination.types.ts
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
}
