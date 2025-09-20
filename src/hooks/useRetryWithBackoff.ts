import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  nextRetryIn: number;
}

export const useRetryWithBackoff = (options: RetryOptions = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 500,
    maxDelay = 4000,
    backoffFactor = 2
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    nextRetryIn: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = (attempt: number): number => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    return Math.min(delay, maxDelay);
  };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = calculateDelay(attempt - 1);
          
          setRetryState({
            isRetrying: true,
            retryCount: attempt,
            nextRetryIn: delay
          });

          // Countdown timer
          let remainingTime = delay;
          const countdownInterval = setInterval(() => {
            remainingTime -= 100;
            setRetryState(prev => ({
              ...prev,
              nextRetryIn: Math.max(0, remainingTime)
            }));
            
            if (remainingTime <= 0) {
              clearInterval(countdownInterval);
            }
          }, 100);
          
          countdownRef.current = countdownInterval;
          
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }

        const result = await operation();
        
        // Success - reset retry state
        setRetryState({
          isRetrying: false,
          retryCount: 0,
          nextRetryIn: 0
        });
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          setRetryState({
            isRetrying: false,
            retryCount: attempt,
            nextRetryIn: 0
          });
          break;
        }
      }
    }
    
    throw lastError!;
  }, [maxRetries, initialDelay, maxDelay, backoffFactor]);

  const cancelRetry = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    setRetryState({
      isRetrying: false,
      retryCount: 0,
      nextRetryIn: 0
    });
  }, []);

  const reset = useCallback(() => {
    cancelRetry();
    setRetryState({
      isRetrying: false,
      retryCount: 0,
      nextRetryIn: 0
    });
  }, [cancelRetry]);

  return {
    executeWithRetry,
    retryState,
    cancelRetry,
    reset,
    canRetry: retryState.retryCount < maxRetries && !retryState.isRetrying
  };
};