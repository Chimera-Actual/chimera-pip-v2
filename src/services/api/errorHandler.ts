import { ApiError, ApiResponse } from './types';
import { reportError } from '@/lib/errorReporting';

export function createApiError(
  message: string,
  code?: string | number,
  details?: Record<string, any>
): ApiError {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function handleApiError<T>(error: unknown): ApiResponse<T> {
  const timestamp = new Date().toISOString();
  
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      data: null as T,
      error: 'Request was cancelled',
      success: false,
      timestamp,
    };
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError;
    
    // Report error for monitoring
    reportError('API Error', {
      component: 'ApiService',
      code: apiError.code,
      details: apiError.details,
    }, new Error(apiError.message));

    return {
      data: null as T,
      error: apiError.message,
      success: false,
      timestamp,
    };
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
  
  // Report error for monitoring
  reportError('API Error', {
    component: 'ApiService',
  }, error instanceof Error ? error : new Error(errorMessage));

  return {
    data: null as T,
    error: errorMessage,
    success: false,
    timestamp,
  };
}

export class ApiErrorHandler {
  private retryableErrors = [
    'NetworkError',
    'TimeoutError',
    'ConnectionError',
    'ECONNRESET',
    'ETIMEDOUT',
  ];

  private rateLimitErrors = [
    '429',
    'TooManyRequests',
    'RateLimitExceeded',
  ];

  isRetryable(error: ApiError): boolean {
    const code = error.code?.toString().toLowerCase() || '';
    const message = error.message.toLowerCase();

    return this.retryableErrors.some(retryableError => 
      code.includes(retryableError.toLowerCase()) ||
      message.includes(retryableError.toLowerCase())
    );
  }

  isRateLimit(error: ApiError): boolean {
    const code = error.code?.toString() || '';
    const message = error.message.toLowerCase();

    return this.rateLimitErrors.some(rateLimitError => 
      code === rateLimitError ||
      message.includes(rateLimitError.toLowerCase())
    );
  }

  getRetryDelay(error: ApiError, attemptNumber: number): number {
    if (this.isRateLimit(error)) {
      // Exponential backoff for rate limiting with longer delays
      return Math.min(1000 * Math.pow(2, attemptNumber), 60000);
    }

    // Standard exponential backoff
    return Math.min(1000 * Math.pow(1.5, attemptNumber), 10000);
  }

  shouldRetry(error: ApiError, attemptNumber: number, maxRetries: number): boolean {
    if (attemptNumber >= maxRetries) {
      return false;
    }

    return this.isRetryable(error) || this.isRateLimit(error);
  }
}

export const apiErrorHandler = new ApiErrorHandler();