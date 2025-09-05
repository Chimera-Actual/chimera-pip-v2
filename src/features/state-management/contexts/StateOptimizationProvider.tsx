import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { debounce, throttle } from '../utils/performanceOptimizer';

interface StateOptimizationContextType {
  // Optimized state update functions
  debouncedUpdate: <T>(key: string, updater: (prev: T) => T, delay?: number) => void;
  throttledUpdate: <T>(key: string, updater: (prev: T) => T, limit?: number) => void;
  
  // Batch operations
  batchStateUpdates: (updates: (() => void)[]) => void;
  
  // Performance monitoring
  measureOperation: <T>(name: string, operation: () => T) => T;
  
  // Cache management
  clearCache: (pattern?: string) => void;
}

const StateOptimizationContext = createContext<StateOptimizationContextType | undefined>(undefined);

export const useStateOptimization = (): StateOptimizationContextType => {
  const context = useContext(StateOptimizationContext);
  if (!context) {
    throw new Error('useStateOptimization must be used within a StateOptimizationProvider');
  }
  return context;
};

interface StateOptimizationProviderProps {
  children: React.ReactNode;
}

export const StateOptimizationProvider: React.FC<StateOptimizationProviderProps> = ({ children }) => {
  // Store for debounced and throttled functions
  const functionCache = useMemo(() => new Map<string, any>(), []);
  
  const debouncedUpdate = useCallback(<T,>(
    key: string, 
    updater: (prev: T) => T, 
    delay = 300
  ) => {
    const cacheKey = `debounce_${key}_${delay}`;
    
    if (!functionCache.has(cacheKey)) {
      functionCache.set(cacheKey, debounce(updater, delay));
    }
    
    const debouncedFn = functionCache.get(cacheKey);
    return debouncedFn;
  }, [functionCache]);

  const throttledUpdate = useCallback(<T,>(
    key: string, 
    updater: (prev: T) => T, 
    limit = 100
  ) => {
    const cacheKey = `throttle_${key}_${limit}`;
    
    if (!functionCache.has(cacheKey)) {
      functionCache.set(cacheKey, throttle(updater, limit));
    }
    
    const throttledFn = functionCache.get(cacheKey);
    return throttledFn;
  }, [functionCache]);

  const batchStateUpdates = useCallback((updates: (() => void)[]) => {
    // Use React's batching mechanism
    React.startTransition(() => {
      updates.forEach(update => update());
    });
  }, []);

  const measureOperation = useCallback(<T,>(name: string, operation: () => T): T => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    console.debug(`Operation ${name} took ${end - start} milliseconds`);
    return result;
  }, []);

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      for (const [key] of functionCache) {
        if (key.includes(pattern)) {
          const fn = functionCache.get(key);
          if (fn && typeof fn.cancel === 'function') {
            fn.cancel();
          }
          functionCache.delete(key);
        }
      }
    } else {
      functionCache.forEach(fn => {
        if (fn && typeof fn.cancel === 'function') {
          fn.cancel();
        }
      });
      functionCache.clear();
    }
  }, [functionCache]);

  const contextValue = useMemo((): StateOptimizationContextType => ({
    debouncedUpdate,
    throttledUpdate,
    batchStateUpdates,
    measureOperation,
    clearCache,
  }), [debouncedUpdate, throttledUpdate, batchStateUpdates, measureOperation, clearCache]);

  return (
    <StateOptimizationContext.Provider value={contextValue}>
      {children}
    </StateOptimizationContext.Provider>
  );
};