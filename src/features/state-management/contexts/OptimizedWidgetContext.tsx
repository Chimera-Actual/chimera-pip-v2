import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useWidgets as useBaseWidgets, WidgetContextType } from '@/contexts/WidgetContext';
import { BaseWidget, TabAssignment } from '@/types/widgets';

interface OptimizedWidgetContextType {
  // Memoized widget selectors
  getWidgetsByTab: (tab: TabAssignment) => BaseWidget[];
  getWidgetById: (id: string) => BaseWidget | undefined;
  getWidgetCount: () => number;
  getTabWidgetCounts: () => Record<string, number>;
  
  // Optimized actions
  batchUpdateWidgets: (updates: Array<{ id: string; updates: Partial<BaseWidget> }>) => Promise<void>;
  moveWidgetToTab: (widgetId: string, targetTab: TabAssignment) => Promise<void>;
}

const OptimizedWidgetContext = createContext<OptimizedWidgetContextType | undefined>(undefined);

export const useOptimizedWidgets = (): OptimizedWidgetContextType => {
  const context = useContext(OptimizedWidgetContext);
  if (!context) {
    throw new Error('useOptimizedWidgets must be used within an OptimizedWidgetProvider');
  }
  return context;
};

interface OptimizedWidgetProviderProps {
  children: React.ReactNode;
}

export const OptimizedWidgetProvider: React.FC<OptimizedWidgetProviderProps> = ({ children }) => {
  // Use a try-catch approach to safely access the widget context
  let widgetContext: WidgetContextType | null = null;
  
  try {
    widgetContext = useBaseWidgets();
  } catch (error) {
    // If WidgetContext is not available, render children directly
    console.warn('OptimizedWidgetProvider: WidgetContext not available, rendering children directly:', error);
    return <>{children}</>;
  }

  // Now we can safely use the widgets context
  const { widgets, updateWidget } = widgetContext;

  // Memoized widget lookup by tab
  const widgetsByTab = useMemo(() => {
    const grouped = widgets.reduce((acc, widget) => {
      const tab = widget.tabAssignment || 'INV';
      if (!acc[tab]) acc[tab] = [];
      acc[tab].push(widget);
      return acc;
    }, {} as Record<string, BaseWidget[]>);
    
    // Sort widgets by order within each tab
    Object.keys(grouped).forEach(tab => {
      grouped[tab].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    return grouped;
  }, [widgets]);

  // Memoized widget lookup by ID
  const widgetById = useMemo(() => {
    return widgets.reduce((acc, widget) => {
      acc[widget.id] = widget;
      return acc;
    }, {} as Record<string, BaseWidget>);
  }, [widgets]);

  // Memoized tab widget counts
  const tabWidgetCounts = useMemo(() => {
    return Object.keys(widgetsByTab).reduce((acc, tab) => {
      acc[tab] = widgetsByTab[tab].length;
      return acc;
    }, {} as Record<string, number>);
  }, [widgetsByTab]);

  // Optimized selectors
  const getWidgetsByTab = useCallback((tab: TabAssignment): BaseWidget[] => {
    return widgetsByTab[tab] || [];
  }, [widgetsByTab]);

  const getWidgetById = useCallback((id: string): BaseWidget | undefined => {
    return widgetById[id];
  }, [widgetById]);

  const getWidgetCount = useCallback((): number => {
    return widgets.length;
  }, [widgets.length]);

  const getTabWidgetCounts = useCallback(() => tabWidgetCounts, [tabWidgetCounts]);

  // Optimized batch operations
  const batchUpdateWidgets = useCallback(async (updates: Array<{ id: string; updates: Partial<BaseWidget> }>) => {
    // Process updates in parallel for better performance
    const updatePromises = updates.map(({ id, updates: widgetUpdates }) => 
      updateWidget(id, widgetUpdates)
    );
    
    try {
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Batch update failed:', error);
      throw error;
    }
  }, [updateWidget]);

  const moveWidgetToTab = useCallback(async (widgetId: string, targetTab: TabAssignment) => {
    const widget = getWidgetById(widgetId);
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found`);
    }

    // Calculate new order based on target tab
    const targetTabWidgets = getWidgetsByTab(targetTab);
    const newOrder = targetTabWidgets.length;

    await updateWidget(widgetId, {
      tabAssignment: targetTab,
      order: newOrder
    });
  }, [getWidgetById, getWidgetsByTab, updateWidget]);

  const contextValue = useMemo((): OptimizedWidgetContextType => ({
    getWidgetsByTab,
    getWidgetById,
    getWidgetCount,
    getTabWidgetCounts,
    batchUpdateWidgets,
    moveWidgetToTab,
  }), [
    getWidgetsByTab,
    getWidgetById,
    getWidgetCount,
    getTabWidgetCounts,
    batchUpdateWidgets,
    moveWidgetToTab,
  ]);

  return (
    <OptimizedWidgetContext.Provider value={contextValue}>
      {children}
    </OptimizedWidgetContext.Provider>
  );
};