import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseAsyncStateOptions {
  initialData?: any;
  resetOnError?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export function useAsyncState<T, TArgs extends any[] = any[]>(
  asyncFunction: (...args: TArgs) => Promise<T>,
  options: UseAsyncStateOptions = {}
): [
  AsyncState<T>,
  (...args: TArgs) => Promise<T | null>,
  () => void,
  (data: T) => void
] {
  const { 
    initialData = null, 
    resetOnError = false, 
    retryCount = 0,
    retryDelay = 1000 
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const currentController = abortControllerRef.current;

      setState(prev => ({
        ...prev,
        loading: true,
        error: resetOnError ? null : prev.error,
      }));

      let attempt = 0;
      const executeWithRetry = async (): Promise<T | null> => {
        try {
          if (currentController.signal.aborted) {
            return null;
          }

          const result = await asyncFunction(...args);
          
          if (currentController.signal.aborted) {
            return null;
          }

          setState({
            data: result,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          });

          return result;
        } catch (error) {
          if (currentController.signal.aborted) {
            return null;
          }

          const errorMessage = error instanceof Error ? error.message : 'An error occurred';

          // Check if we should retry
          if (attempt < retryCount) {
            attempt++;
            return new Promise((resolve) => {
              retryTimeoutRef.current = setTimeout(() => {
                resolve(executeWithRetry());
              }, retryDelay);
            });
          }

          setState({
            data: resetOnError ? null : state.data,
            loading: false,
            error: errorMessage,
            lastUpdated: new Date(),
          });

          return null;
        }
      };

      return executeWithRetry();
    },
    [asyncFunction, resetOnError, retryCount, retryDelay, state.data]
  );

  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date(),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return [state, execute, reset, setData];
}

export function useAsyncOperation<T>(
  initialValue: T | null = null
): [
  AsyncState<T>,
  (promise: Promise<T>) => Promise<T | null>,
  () => void,
  (data: T) => void
] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialValue,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (promise: Promise<T>): Promise<T | null> => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await promise;
      
      if (currentController.signal.aborted) {
        return null;
      }

      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });

      return result;
    } catch (error) {
      if (currentController.signal.aborted) {
        return null;
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        lastUpdated: new Date(),
      }));

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      data: initialValue,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, [initialValue]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date(),
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return [state, execute, reset, setData];
}