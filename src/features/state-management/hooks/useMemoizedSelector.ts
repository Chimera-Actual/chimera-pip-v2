import { useMemo, useRef } from 'react';
import { isEqual } from 'lodash';

type Selector<T, R> = (state: T) => R;

/**
 * Advanced memoization hook that uses deep equality checking
 * to prevent unnecessary re-computations and re-renders
 */
export function useMemoizedSelector<T, R>(
  state: T,
  selector: Selector<T, R>,
  deps?: React.DependencyList
): R {
  const previousResult = useRef<R>();
  const previousState = useRef<T>();

  return useMemo(() => {
    // Only recompute if state has actually changed
    if (!isEqual(state, previousState.current)) {
      const result = selector(state);
      
      // Only update if result has changed
      if (!isEqual(result, previousResult.current)) {
        previousResult.current = result;
      }
      
      previousState.current = state;
    }
    
    return previousResult.current as R;
  }, deps ? [state, ...deps] : [state]);
}

/**
 * Lightweight memoization for primitive values and shallow objects
 */
export function useShallowMemoizedSelector<T, R>(
  state: T,
  selector: Selector<T, R>,
  deps?: React.DependencyList
): R {
  return useMemo(() => selector(state), deps ? [state, ...deps] : [state]);
}

/**
 * Memoized selector with custom equality function
 */
export function useMemoizedSelectorWithEquality<T, R>(
  state: T,
  selector: Selector<T, R>,
  equalityFn: (a: R, b: R) => boolean,
  deps?: React.DependencyList
): R {
  const previousResult = useRef<R>();

  return useMemo(() => {
    const result = selector(state);
    
    if (!previousResult.current || !equalityFn(result, previousResult.current)) {
      previousResult.current = result;
    }
    
    return previousResult.current;
  }, deps ? [state, ...deps] : [state]);
}