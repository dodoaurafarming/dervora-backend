export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta: ApiMeta | null;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown | null;
  };
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;