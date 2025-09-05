// Performance monitoring and reporting utilities
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  fcp?: number;  // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  componentRenderTime?: Record<string, number>;
  apiCallDuration?: Record<string, number>;
  memoryUsage?: number;
  bundleSize?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private componentTimings: Map<string, number> = new Map();
  private apiTimings: Map<string, number> = new Map();

  constructor() {
    this.initializeObservers();
    this.trackMemoryUsage();
  }

  // Initialize performance observers for Web Vitals
  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-input') {
              this.metrics.fid = entry.processingStart - entry.startTime;
              this.reportMetric('FID', this.metrics.fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // Only count layout shifts without recent user input
            if (!(entry as any).hadRecentInput) {
              const firstSessionEntry = clsEntries[0];
              const lastSessionEntry = clsEntries[clsEntries.length - 1];
              
              // If the entry is too far from the previous entries, start a new session
              if (entry.startTime - lastSessionEntry?.startTime > 1000 ||
                  entry.startTime - firstSessionEntry?.startTime > 5000) {
                clsEntries = [entry];
                clsValue = (entry as any).value;
              } else {
                clsEntries.push(entry);
                clsValue += (entry as any).value;
              }
              
              this.metrics.cls = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        // CLS not supported
      }
    }

    // First Contentful Paint & Time to First Byte
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.reportMetric('FCP', entry.startTime);
        }
      });

      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        this.reportMetric('TTFB', this.metrics.ttfb);
      }
    }
  }

  // Track memory usage
  private trackMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        this.metrics.memoryUsage = memInfo.usedJSHeapSize / 1048576; // Convert to MB
      }, 10000); // Check every 10 seconds
    }
  }

  // Track component render time
  startComponentTracking(componentName: string) {
    this.componentTimings.set(componentName, performance.now());
  }

  endComponentTracking(componentName: string) {
    const startTime = this.componentTimings.get(componentName);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (!this.metrics.componentRenderTime) {
        this.metrics.componentRenderTime = {};
      }
      this.metrics.componentRenderTime[componentName] = duration;
      this.componentTimings.delete(componentName);
      
      // Report slow renders
      if (duration > 16) { // Longer than one frame (60fps)
        this.reportMetric('SlowRender', duration, { component: componentName });
      }
    }
  }

  // Track API call duration
  startApiTracking(endpoint: string): string {
    const id = `${endpoint}-${Date.now()}`;
    this.apiTimings.set(id, performance.now());
    return id;
  }

  endApiTracking(trackingId: string) {
    const startTime = this.apiTimings.get(trackingId);
    if (startTime) {
      const duration = performance.now() - startTime;
      const endpoint = trackingId.split('-')[0];
      
      if (!this.metrics.apiCallDuration) {
        this.metrics.apiCallDuration = {};
      }
      this.metrics.apiCallDuration[endpoint] = duration;
      this.apiTimings.delete(trackingId);
      
      // Report slow API calls
      if (duration > 1000) {
        this.reportMetric('SlowAPI', duration, { endpoint });
      }
    }
  }

  // Custom performance marks
  mark(name: string) {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string) {
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
      
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const measure = measures[measures.length - 1];
        return measure.duration;
      }
    } catch (e) {
      // Measurement failed
    }
    return null;
  }

  // Report metric to analytics or monitoring service
  private reportMetric(name: string, value: number, metadata?: Record<string, any>) {
    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // Example: send to Google Analytics
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'performance', {
          event_category: 'Web Vitals',
          event_label: name,
          value: Math.round(value),
          ...metadata
        });
      }

      // Or send to custom endpoint
      if (value > this.getThreshold(name)) {
        this.sendToMonitoring({
          metric: name,
          value,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          ...metadata
        });
      }
    }

    // Log in development
    if (import.meta.env.DEV) {
      const emoji = this.getMetricEmoji(name, value);
      console.info(`${emoji} ${name}: ${value.toFixed(2)}ms`, metadata);
    }
  }

  // Get threshold for each metric
  private getThreshold(metric: string): number {
    const thresholds: Record<string, number> = {
      LCP: 2500,    // Good: < 2.5s
      FID: 100,     // Good: < 100ms
      CLS: 0.1,     // Good: < 0.1
      FCP: 1800,    // Good: < 1.8s
      TTFB: 800,    // Good: < 800ms
      SlowRender: 16, // One frame at 60fps
      SlowAPI: 1000   // 1 second
    };
    return thresholds[metric] || Infinity;
  }

  // Get emoji for metric performance
  private getMetricEmoji(metric: string, value: number): string {
    const threshold = this.getThreshold(metric);
    if (value <= threshold) return '✅';
    if (value <= threshold * 1.5) return '⚠️';
    return '❌';
  }

  // Send metrics to monitoring service
  private async sendToMonitoring(data: Record<string, any>) {
    try {
      // Queue for background sync if offline
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const cache = await caches.open('performance-metrics');
        const request = new Request('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        await cache.put(request, new Response(JSON.stringify(data)));
        
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-metrics');
      } else {
        // Direct send if online
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(() => {
          // Silently fail
        });
      }
    } catch (e) {
      // Monitoring failed
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Clear all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    performanceMonitor.startComponentTracking(componentName);
    return () => {
      performanceMonitor.endComponentTracking(componentName);
    };
  }, [componentName]);
}

// Utility to track async operations
export async function trackAsyncOperation<T>(
  operation: () => Promise<T>,
  name: string
): Promise<T> {
  const trackingId = performanceMonitor.startApiTracking(name);
  try {
    const result = await operation();
    return result;
  } finally {
    performanceMonitor.endApiTracking(trackingId);
  }
}

// Export for use in other parts of the app
export default performanceMonitor;