import { useEffect, useRef, useCallback } from 'react';
import { reportPerformance } from '@/lib/errorReporting';

interface PerformanceMetrics {
  renderTime: number;
  componentMount: number;
  componentUpdate: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string, enabled: boolean = true) => {
  const mountTimeRef = useRef<number>();
  const renderStartRef = useRef<number>();
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    componentMount: 0,
    componentUpdate: 0
  });

  // Mark render start
  const markRenderStart = useCallback(() => {
    if (enabled) {
      renderStartRef.current = performance.now();
    }
  }, [enabled]);

  // Mark render end
  const markRenderEnd = useCallback(() => {
    if (enabled && renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      metricsRef.current.renderTime = renderTime;
      
      if (renderTime > 16) { // More than one frame (60fps = 16ms)
        reportPerformance(`${componentName}_slow_render`, renderTime, {
          component: componentName,
          metadata: { threshold: 16 }
        });
      }
    }
  }, [enabled, componentName]);

  // Component mount tracking
  useEffect(() => {
    if (!enabled) return;

    mountTimeRef.current = performance.now();
    
    return () => {
      if (mountTimeRef.current) {
        const mountTime = performance.now() - mountTimeRef.current;
        metricsRef.current.componentMount = mountTime;
        
        reportPerformance(`${componentName}_mount_time`, mountTime, {
          component: componentName
        });
      }
    };
  }, [enabled, componentName]);

  // Memory usage tracking
  const trackMemoryUsage = useCallback(() => {
    if (enabled && 'memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      metricsRef.current.memoryUsage = memoryUsage;
      
      if (memoryUsage > 100) { // Alert if over 100MB
        reportPerformance(`${componentName}_high_memory`, memoryUsage, {
          component: componentName,
          metadata: { threshold: 100 }
        });
      }
    }
  }, [enabled, componentName]);

  // Long task detection
  useEffect(() => {
    if (!enabled || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold
          reportPerformance(`${componentName}_long_task`, entry.duration, {
            component: componentName,
            metadata: { 
              threshold: 50,
              entryType: entry.entryType 
            }
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  }, [enabled, componentName]);

  return {
    markRenderStart,
    markRenderEnd,
    trackMemoryUsage,
    getMetrics: () => metricsRef.current
  };
};

// Hook for measuring component lifecycle performance
export const useComponentMetrics = (componentName: string) => {
  const { markRenderStart, markRenderEnd, trackMemoryUsage } = usePerformanceMonitor(componentName);

  useEffect(() => {
    markRenderStart();
    
    // Track memory on mount and updates
    trackMemoryUsage();
  });

  useEffect(() => {
    markRenderEnd();
  });

  return {
    trackMemoryUsage
  };
};