// Timeout Hook
import { useCallback, useEffect, useRef } from 'react';

export function useTimeout(callback: () => void, delay: number | null): {
  reset: () => void;
  clear: () => void;
} {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => callbackRef.current(), delay || 0);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (delay !== null) {
      set();
      return clear;
    }
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { reset, clear };
}