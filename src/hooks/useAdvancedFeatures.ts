import { useCallback, useMemo, useState } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface AdvancedFeatureState {
  bulkOperationsEnabled: boolean;
  selectedWidgets: string[];
  autoSaveEnabled: boolean;
  analyticsEnabled: boolean;
  advancedGridEnabled: boolean;
}

interface BulkOperationOptions {
  operation: 'archive' | 'delete' | 'export' | 'move';
  targetTab?: string;
  confirmation?: boolean;
}

export const useAdvancedFeatures = () => {
  const { getWidgetsByTab, archiveWidget, removeWidget, updateWidget } = useWidgets();
  const { trackMemoryUsage, getMetrics } = usePerformanceMonitor('AdvancedFeatures');
  
  const [featureState, setFeatureState] = useState<AdvancedFeatureState>({
    bulkOperationsEnabled: false,
    selectedWidgets: [],
    autoSaveEnabled: true,
    analyticsEnabled: true,
    advancedGridEnabled: false,
  });

  // Get all widgets helper
  const getAllWidgets = useCallback(() => {
    const tabs = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO'] as const;
    return tabs.flatMap(tab => getWidgetsByTab(tab));
  }, [getWidgetsByTab]);

  // Bulk Operations
  const toggleBulkOperations = useCallback(() => {
    setFeatureState(prev => ({
      ...prev,
      bulkOperationsEnabled: !prev.bulkOperationsEnabled,
      selectedWidgets: prev.bulkOperationsEnabled ? [] : prev.selectedWidgets
    }));
  }, []);

  const selectWidget = useCallback((widgetId: string) => {
    setFeatureState(prev => ({
      ...prev,
      selectedWidgets: prev.selectedWidgets.includes(widgetId)
        ? prev.selectedWidgets.filter(id => id !== widgetId)
        : [...prev.selectedWidgets, widgetId]
    }));
  }, []);

  const getWidgetAnalytics = useCallback(() => {
    const widgets = getAllWidgets();
    const metrics = getMetrics();
    
    return {
      totalWidgets: widgets.length,
      activeWidgets: widgets.filter(w => !w.archived).length,
      archivedWidgets: widgets.filter(w => w.archived).length,
      widgetsByType: widgets.reduce((acc, widget) => {
        acc[widget.type] = (acc[widget.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      performanceMetrics: metrics,
      memoryUsage: trackMemoryUsage(),
    };
  }, [getAllWidgets, getMetrics, trackMemoryUsage]);

  const memoizedValue = useMemo(() => ({
    ...featureState,
    toggleBulkOperations,
    selectWidget,
    getWidgetAnalytics,
  }), [
    featureState,
    toggleBulkOperations,
    selectWidget,
    getWidgetAnalytics,
  ]);

  return memoizedValue;
};