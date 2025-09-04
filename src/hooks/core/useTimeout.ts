import { useCallback, useEffect, useRef } from 'react';

export function useTimeout(
  callback: () => void,
  delay: number | null
): [() => void, () => void] {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout if delay is provided
    if (delay !== null) {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delay);
    }
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Start timeout when delay changes
  useEffect(() => {
    start();
    return clear;
  }, [start, clear]);

  // Cleanup on unmount
  useEffect(() => {
    return clear;
  }, [clear]);

  return [start, clear];
}

export function useInterval(
  callback: () => void,
  delay: number | null
): [() => void, () => void] {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval if delay is provided
    if (delay !== null) {
      intervalRef.current = setInterval(() => {
        callbackRef.current();
      }, delay);
    }
  }, [delay]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start interval when delay changes
  useEffect(() => {
    start();
    return clear;
  }, [start, clear]);

  // Cleanup on unmount
  useEffect(() => {
    return clear;
  }, [clear]);

  return [start, clear];
}

export function useDelayedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number
): void {
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      cleanupRef.current = effect();
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}