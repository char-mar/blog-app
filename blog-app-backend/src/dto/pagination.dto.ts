export interface PaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface PaginatedResponseDto<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
