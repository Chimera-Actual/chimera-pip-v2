import { useState, useCallback, useRef, useEffect } from 'react';
import { reportError } from '@/lib/errorReporting';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  loadingText?: string;
}

export interface LoadingActions {
  setLoading: (loading: boolean, text?: string) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
  withLoading: <T>(
    asyncFn: () => Promise<T>,
    options?: {
      loadingText?: string;
      errorPrefix?: string;
      onError?: (error: unknown) => void;
    }
  ) => Promise<T | null>;
}

export interface UseLoadingStateResult extends LoadingState, LoadingActions {}

/**
 * Consistent loading state management hook with automatic error handling
 * and cleanup to prevent memory leaks from async operations.
 */
export function useLoadingState(
  initialLoading = false,
  componentName?: string
): UseLoadingStateResult {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    loadingText: undefined
  });

  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setLoading = useCallback((loading: boolean, text?: string) => {
    if (!isMountedRef.current) return;
    setState(prev => ({
      ...prev,
      isLoading: loading,
      loadingText: text,
      error: loading ? null : prev.error // Clear error when starting to load
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    if (!isMountedRef.current) return;
    setState(prev => ({
      ...prev,
      error,
      isLoading: false // Stop loading when error occurs
    }));
  }, []);

  const clearState = useCallback(() => {
    if (!isMountedRef.current) return;
    setState({
      isLoading: false,
      error: null,
      loadingText: undefined
    });
  }, []);

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      loadingText?: string;
      errorPrefix?: string;
      onError?: (error: unknown) => void;
    } = {}
  ): Promise<T | null> => {
    const { loadingText, errorPrefix = 'Operation failed', onError } = options;
    
    if (!isMountedRef.current) return null;

    setLoading(true, loadingText);

    try {
      const result = await asyncFn();
      
      if (!isMountedRef.current) return null;
      
      setLoading(false);
      return result;
    } catch (error) {
      if (!isMountedRef.current) return null;

      const errorMessage = error instanceof Error ? error.message : String(error);
      const fullErrorMessage = `${errorPrefix}: ${errorMessage}`;
      
      setError(fullErrorMessage);

      // Report error for monitoring
      reportError(
        fullErrorMessage,
        {
          component: componentName || 'useLoadingState',
          action: 'withLoading',
          metadata: { errorPrefix, originalError: errorMessage }
        },
        error
      );

      // Call custom error handler
      onError?.(error);

      return null;
    }
  }, [setLoading, setError, componentName]);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    loadingText: state.loadingText,
    
    // Actions
    setLoading,
    setError,
    clearState,
    withLoading
  };
}