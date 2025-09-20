import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  componentTree: Record<string, number>;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  trackRender: (componentName: string, renderTime: number) => void;
  trackMemoryUsage: () => void;
  resetMetrics: () => void;
  enableProfiling: boolean;
  setEnableProfiling: (enabled: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableByDefault?: boolean;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ 
  children, 
  enableByDefault = false 
}) => {
  const [enableProfiling, setEnableProfiling] = useState(enableByDefault);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    componentTree: {},
  });

  const renderTimes = useRef<number[]>([]);
  const memoryCheckInterval = useRef<NodeJS.Timeout>();

  const trackRender = useCallback((componentName: string, renderTime: number) => {
    if (!enableProfiling) return;
    
    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1;
      renderTimes.current.push(renderTime);
      
      // Keep only last 100 render times for average calculation
      if (renderTimes.current.length > 100) {
        renderTimes.current = renderTimes.current.slice(-100);
      }
      
      const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
      
      return {
        ...prev,
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime,
        componentTree: {
          ...prev.componentTree,
          [componentName]: (prev.componentTree[componentName] || 0) + 1,
        },
      };
    });
  }, [enableProfiling]);

  const trackMemoryUsage = useCallback(() => {
    if (!enableProfiling || !(performance as any).memory) return;
    
    const memoryInfo = (performance as any).memory;
    setMetrics(prev => ({
      ...prev,
      memoryUsage: memoryInfo.usedJSHeapSize,
    }));
  }, [enableProfiling]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      componentTree: {},
    });
    renderTimes.current = [];
  }, []);

  // Automatic memory tracking every 30 seconds when profiling is enabled
  useEffect(() => {
    if (!enableProfiling) return;
    
    const id = setInterval(() => {
      trackMemoryUsage();
    }, 30000);
    
    return () => clearInterval(id);
  }, [enableProfiling, trackMemoryUsage]);

  const contextValue = useMemo((): PerformanceContextType => ({
    metrics,
    trackRender,
    trackMemoryUsage,
    resetMetrics,
    enableProfiling,
    setEnableProfiling,
  }), [metrics, trackRender, trackMemoryUsage, resetMetrics, enableProfiling]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};
