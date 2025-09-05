/**
 * Performance optimization utilities
 */

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T & { cancel(): void } {
  let timeout: NodeJS.Timeout | null = null;
  let result: ReturnType<T>;

  const debounced = function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) result = func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) result = func.apply(this, args);
    
    return result;
  } as T & { cancel(): void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Throttle function for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel(): void } {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  const throttled = function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return lastResult;
  } as T & { cancel(): void };

  throttled.cancel = () => {
    inThrottle = false;
  };

  return throttled;
}

// Memoization with size limit
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxSize = 100
): T & { cache: Map<string, any>; clear(): void } {
  const cache = new Map<string, any>();

  const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    
    // Implement LRU eviction if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  } as T & { cache: Map<string, any>; clear(): void };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();

  return memoized;
}

// Batch DOM operations to prevent layout thrashing
export function batchDOMUpdates(updates: (() => void)[]): void {
  // Use requestAnimationFrame for optimal timing
  requestAnimationFrame(() => {
    // Batch all DOM reads first
    const measurements: any[] = [];
    updates.forEach((update, index) => {
      // If the update function returns a value, it's likely a DOM read
      try {
        const result = update();
        measurements[index] = result;
      } catch (e) {
        // Update function might not return anything
      }
    });

    // Then batch all DOM writes
    requestAnimationFrame(() => {
      updates.forEach(update => {
        try {
          update();
        } catch (e) {
          console.warn('DOM update failed:', e);
        }
      });
    });
  });
}

// Check if element is visible in viewport (for virtualization)
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewHeight &&
    rect.right <= viewWidth
  );
}

// Intersection Observer utility for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Memory usage monitoring
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null {
  if (!(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}