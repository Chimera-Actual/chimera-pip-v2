// API Service Types for Chimera-PIP 4000 mk2

export interface ApiResponse<T = any> {
  data: T;
  error: string | null;
  success: boolean;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, any>;
  timestamp: string;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  invalidateOn?: string[]; // Events that should invalidate this cache
}

export interface QueryOptions extends RequestConfig {
  cache?: CacheConfig;
  background?: boolean; // Whether to run in background without loading state
}

export interface MutationOptions extends RequestConfig {
  optimisticUpdate?: (currentData: any, variables: any) => any;
  rollbackOnError?: boolean;
  invalidateQueries?: string[]; // Query keys to invalidate on success
}

export interface WebhookConfig {
  url: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface RealtimeConfig {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
}

// Cache entry structure
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}