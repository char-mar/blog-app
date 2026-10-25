export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export const successResponse = <T>(
  data: T,
  message?: string,
): ApiResponse<T> => ({
  success: true,
  ...(message && { message }),
  data,
});
