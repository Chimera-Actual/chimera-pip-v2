// API Error Handler Service
import { ApiResponse, ApiError } from './types';
import { reportError } from '@/lib/errorReporting';

class ApiErrorHandler {
  createApiError(message: string, status?: number, code?: string): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.code = code;
    return error;
  }

  handleApiError(error: any, context?: Record<string, any>): ApiResponse<any> {
    let message = 'An unknown error occurred';
    let status = 500;

    if (error instanceof Error) {
      message = error.message;
    }

    if (error?.status) {
      status = error.status;
    }

    // Report error for monitoring
    reportError('API Error', {
      component: 'ApiErrorHandler',
      status,
      ...context
    }, error);

    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }

  isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message === 'Failed to fetch';
  }

  isTimeoutError(error: any): boolean {
    return error?.name === 'AbortError' || error?.message?.includes('timeout');
  }

  isAuthError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  getErrorType(error: any): 'network' | 'timeout' | 'auth' | 'server' | 'client' | 'unknown' {
    if (this.isNetworkError(error)) return 'network';
    if (this.isTimeoutError(error)) return 'timeout';
    if (this.isAuthError(error)) return 'auth';
    
    const status = error?.status || 500;
    if (status >= 500) return 'server';
    if (status >= 400) return 'client';
    
    return 'unknown';
  }
}

export const errorHandler = new ApiErrorHandler();