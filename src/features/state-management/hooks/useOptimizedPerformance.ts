import { useCallback, useRef, useEffect } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface PerformanceHookOptions {
  componentName: string;
  trackMemory?: boolean;
  throttleMs?: number;
}

export const useOptimizedPerformance = ({ 
  componentName, 
  trackMemory = false,
  throttleMs = 16 // 60fps
}: PerformanceHookOptions) => {
  const { trackRender, trackMemoryUsage, enableProfiling } = usePerformance();
  const startTimeRef = useRef<number>();
  const lastTrackTime = useRef<number>(0);

  const markRenderStart = useCallback(() => {
    if (!enableProfiling) return;
    startTimeRef.current = performance.now();
  }, [enableProfiling]);

  const markRenderEnd = useCallback(() => {
    if (!enableProfiling || !startTimeRef.current) return;
    
    const now = performance.now();
    const renderTime = now - startTimeRef.current;
    
    // Throttle tracking to avoid performance overhead
    if (now - lastTrackTime.current >= throttleMs) {
      trackRender(componentName, renderTime);
      lastTrackTime.current = now;
      
      if (trackMemory) {
        trackMemoryUsage();
      }
    }
    
    startTimeRef.current = undefined;
  }, [enableProfiling, componentName, trackRender, trackMemory, trackMemoryUsage, throttleMs]);

  // Auto-track render on effect runs
  useEffect(() => {
    if (enableProfiling) {
      markRenderStart();
      return markRenderEnd;
    }
  });

  return {
    markRenderStart,
    markRenderEnd,
    trackMemoryUsage,
  };
};