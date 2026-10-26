export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDto<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}
