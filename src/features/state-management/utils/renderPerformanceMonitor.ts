import { useEffect, useRef, useMemo } from 'react';
import React from 'react';
import { throttle } from './performanceOptimizer';

interface RenderMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  maxRenderTime: number;
}

/**
 * Performance monitoring hook for tracking component render metrics
 * Useful for identifying performance bottlenecks in production
 */
export function useRenderPerformanceMonitor(componentName: string, enabled: boolean = false) {
  const metricsRef = useRef<RenderMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
  });
  
  const startTimeRef = useRef<number>(0);

  // Throttled performance logger to prevent spam
  const logMetrics = useMemo(
    () => throttle((metrics: RenderMetrics) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Render Performance [${componentName}]:`, {
          renders: metrics.renderCount,
          lastRender: `${metrics.lastRenderTime.toFixed(2)}ms`,
          avgRender: `${metrics.averageRenderTime.toFixed(2)}ms`,
          maxRender: `${metrics.maxRenderTime.toFixed(2)}ms`,
        });
      }
    }, 1000),
    [componentName]
  );

  useEffect(() => {
    if (!enabled) return;
    
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      const metrics = metricsRef.current;
      metrics.renderCount++;
      metrics.lastRenderTime = renderTime;
      metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime);
      
      // Calculate running average
      metrics.averageRenderTime = 
        (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
      
      // Log metrics every 10 renders or if render time is concerning
      if (metrics.renderCount % 10 === 0 || renderTime > 50) {
        logMetrics(metrics);
      }
    };
  });

  return metricsRef.current;
}

/**
 * Memory usage monitoring for detecting memory leaks
 */
export function useMemoryMonitor(componentName: string, enabled: boolean = false) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        // Log warning if memory usage is high
        if (usedMB / limitMB > 0.8) {
          console.warn(`🧠 High Memory Usage in [${componentName}]:`, {
            used: `${usedMB}MB`,
            total: `${totalMB}MB`,
            limit: `${limitMB}MB`,
            usage: `${Math.round((usedMB / limitMB) * 100)}%`
          });
        }
      }
    };

    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [componentName, enabled]);
}

/**
 * Production-safe performance wrapper for components
 */
export function withPerformanceMonitoring<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  const PerformanceMonitoredComponent = (props: P) => {
    // Only enable in development or when explicitly enabled
    const monitoringEnabled = process.env.NODE_ENV === 'development' || 
      localStorage.getItem('enablePerformanceMonitoring') === 'true';
    
    useRenderPerformanceMonitor(componentName, monitoringEnabled);
    useMemoryMonitor(componentName, monitoringEnabled);
    
    return React.createElement(Component, props);
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return PerformanceMonitoredComponent;
}