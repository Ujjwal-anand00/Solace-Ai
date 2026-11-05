/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: ApiErrorDetail;
}

/**
 * Standard error details attached to failed responses
 */
export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Health check endpoint response schema
 */
export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
