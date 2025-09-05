import { useCallback } from 'react';
import { BaseWidget, WidgetType, WidgetWidth } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';

export const useWidgetActions = (tab: string) => {
  const { 
    addWidget, 
    removeWidget, 
    archiveWidget,
    updateWidget
  } = useWidgets();

  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    return addWidget(widgetType, tab as any);
  }, [addWidget, tab]);

  const handleDelete = useCallback((widgetId: string) => {
    return removeWidget(widgetId);
  }, [removeWidget]);

  const handleArchive = useCallback((widgetId: string) => {
    return archiveWidget(widgetId);
  }, [archiveWidget]);

  const handleUpdate = useCallback((widgetId: string, updates: Partial<BaseWidget>) => {
    return updateWidget(widgetId, updates);
  }, [updateWidget]);

  const handleToggleWidth = useCallback((widget: BaseWidget) => {
    const newWidth: WidgetWidth = widget.widgetWidth === 'full' ? 'half' : 'full';
    return updateWidget(widget.id, { widgetWidth: newWidth });
  }, [updateWidget]);

  return {
    handleAddWidget,
    handleDelete,
    handleArchive,
    handleUpdate,
    handleToggleWidth
  };
};