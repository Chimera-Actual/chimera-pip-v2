import { useState, useCallback } from 'react';
import { BaseWidget } from '@/types/widgets';

interface UseWidgetGridReturn {
  widgets: BaseWidget[];
  addWidget: (widget: BaseWidget) => void;
  updateWidget: (id: string, updates: Partial<BaseWidget>) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
}

export const useWidgetGrid = (initialWidgets: BaseWidget[] = []): UseWidgetGridReturn => {
  const [widgets, setWidgets] = useState<BaseWidget[]>(initialWidgets);

  const addWidget = useCallback((widget: BaseWidget) => {
    setWidgets(prev => [...prev, widget]);
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<BaseWidget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  }, []);

  const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
    setWidgets(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    widgets,
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets
  };
};