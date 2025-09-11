export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  data: Record<string, any>;
}