import { PostgrestError } from '@supabase/supabase-js';
import { reportError } from '@/lib/errorReporting';

export interface AppError {
  message: string;
  code?: string | number;
  details?: Record<string, any>;
  userMessage: string;
}

export const normalizeError = (error: unknown, context?: string): AppError => {
  // Handle Supabase/PostgrestError
  if (error && typeof error === 'object' && 'message' in error) {
    const pgError = error as PostgrestError;
    
    // Report to error tracking
    reportError(`${context || 'Database'} Error`, {
      code: pgError.code,
      details: pgError.details,
      hint: pgError.hint,
    }, new Error(pgError.message));
    
    // User-friendly messages
    const friendlyMessages: Record<string, string> = {
      '23505': 'This item already exists. Please try a different name.',
      '42501': 'You do not have permission to perform this action.',
      'PGRST116': 'The requested item was not found.',
      'PGRST301': 'You do not have permission to access this resource.',
    };
    
    return {
      message: pgError.message,
      code: pgError.code,
      details: typeof pgError.details === 'object' ? pgError.details : { details: pgError.details },
      userMessage: friendlyMessages[pgError.code] || 'An error occurred. Please try again.',
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    reportError(`${context || 'Application'} Error`, {}, error);
    
    return {
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    const errorMsg = error;
    reportError(`${context || 'Application'} Error`, {}, new Error(errorMsg));
    
    return {
      message: errorMsg,
      userMessage: 'An error occurred. Please try again.',
    };
  }
  
  // Fallback for unknown errors
  const unknownError = new Error('Unknown error occurred');
  reportError(`${context || 'Application'} Unknown Error`, { error }, unknownError);
  
  return {
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please refresh the page and try again.',
  };
};

export const handleAsyncError = (error: unknown, context?: string): AppError => {
  const normalizedError = normalizeError(error, context);
  console.error(`[${context || 'Error'}]:`, normalizedError);
  return normalizedError;
};