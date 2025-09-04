// API Service Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  context?: Record<string, any>;
}