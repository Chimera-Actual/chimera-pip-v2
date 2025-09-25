import React, { useState, memo, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useMemoizedSelector } from '@/features/state-management/hooks/useMemoizedSelector';

import { AtomicClockWidget } from '@/components/widgets/AtomicClockWidget';
import { WeatherDashboardWidget } from '@/components/widgets/WeatherDashboardWidget';
import AIAgentWidget from '@/components/widgets/AIAgentWidget';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserWidget } from '@/hooks/useWidgetManager';

// Widget descriptions mapping
const widgetDescriptions: Record<string, string> = {
  'atomic_clock': 'Multi-timezone atomic clock with alarms, themes, and retro visual effects',
  'weather_dashboard': 'Complete weather station with current conditions, forecast, air quality, and Pip-Boy radiation mode',
  'ai_agent': 'Chat with AI agents using custom webhooks or the built-in Supabase AI service',
  // Add more widget descriptions as needed
};

interface CanvasIntegrationProps {
  tab: string;
  widgets: UserWidget[];
  activeWidget: UserWidget | null;
  isLoading: boolean;
  isActive?: boolean;
  className?: string;
  onDoubleClick?: () => void;
  onDeleteWidget: (widgetId: string) => Promise<boolean>;
  onUpdateWidget: (widgetId: string, updates: Partial<UserWidget>) => Promise<boolean>;
  onToggleCollapsed: (widget: UserWidget) => Promise<boolean>;
}

export const CanvasIntegration = memo<CanvasIntegrationProps>(({ 
  tab, 
  widgets,
  activeWidget,
  isLoading,
  isActive = true,
  className, 
  onDoubleClick,
  onDeleteWidget,
  onUpdateWidget,
  onToggleCollapsed
}) => {
  // Display only the active widget in full space
  const displayWidget = useMemoizedSelector(
    { activeWidget, isActive },
    ({ activeWidget, isActive }) => {
      if (!isActive || !activeWidget || activeWidget.is_archived) return null;
      return activeWidget;
    },
    [activeWidget, isActive]
  );

  // Memoize widget interaction handlers 
  const memoizedHandlers = useMemo(() => ({
    handleCloseWidget: async (widgetId: string) => {
      await onDeleteWidget(widgetId);
    },
    
    handleToggleCollapse: async (widget: UserWidget) => {
      await onToggleCollapsed(widget);
    },
    
    handleToggleFullWidth: async (widget: UserWidget) => {
      const newWidth = widget.widget_width === 'full' ? 'half' : 'full';
      await onUpdateWidget(widget.id, { widget_width: newWidth });
    },
    
    handleSaveSettings: async (widgetId: string, config: any) => {
      await onUpdateWidget(widgetId, { widget_config: config });
    }
  }), [onDeleteWidget, onToggleCollapsed, onUpdateWidget]);
  
  // Memoized widget renderer to prevent unnecessary re-renders
  const renderWidgetContent = useCallback((widget: UserWidget) => {
    // Skip rendering for inactive tabs - just return placeholder
    if (!isActive) {
      return (
        <div className="h-48 bg-pip-bg-secondary/20 rounded border border-pip-border animate-pulse" />
      );
    }

    
    const normalizedType = (widget.widget_type || '').toLowerCase().replace(/[^a-z]/g, '');
    const { handleCloseWidget, handleToggleCollapse, handleToggleFullWidth, handleSaveSettings } = memoizedHandlers;
    
    switch (normalizedType) {
      case 'atomicclock':
      case 'clockwidget':
         return (
           <AtomicClockWidget
             title={widget.widget_config?.title || 'Atomic Clock'}
             settings={widget.widget_config || {}}
             onSettingsChange={(settings) => handleSaveSettings(widget.id, settings)}
             widgetId={widget.id}
             widget={widget}
             onRemove={() => handleCloseWidget(widget.id)}
             onToggleCollapse={() => handleToggleCollapse(widget)}
             onToggleFullWidth={() => handleToggleFullWidth(widget)}
           />
         );
      case 'weatherdashboard':
      case 'weather':
         return (
           <WeatherDashboardWidget
             title={widget.widget_config?.title || 'Weather Dashboard'}
             settings={widget.widget_config || {}}
             onSettingsChange={(settings) => handleSaveSettings(widget.id, settings)}
             widgetId={widget.id}
             widget={widget}
             onRemove={() => handleCloseWidget(widget.id)}
             onToggleCollapse={() => handleToggleCollapse(widget)}
             onToggleFullWidth={() => handleToggleFullWidth(widget)}
           />
         );
      case 'aiagent':
      case 'ai-agent':
         return (
           <AIAgentWidget
             widgetId={widget.id}
             widget={widget}
             onConfigUpdate={(config) => handleSaveSettings(widget.id, config)}
             onClose={() => handleCloseWidget(widget.id)}
             onCollapse={() => handleToggleCollapse(widget)}
             onToggleFullWidth={() => handleToggleFullWidth(widget)}
           />
         );
      default:
        return (
          <ScrollArea className="h-48">
            <div className="p-6">
              <div className="space-y-2 text-pip-text-secondary font-pip-mono text-xs">
                <div>Color: {widget.widget_config?.colorValue || 'N/A'}</div>
                <div>Text: {widget.widget_config?.textInput || 'N/A'}</div>
                <div>Number: {widget.widget_config?.numberInput || 0}</div>
              </div>
            </div>
          </ScrollArea>
        );
    }
  }, [isActive, memoizedHandlers]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div 
        className="h-full flex items-center justify-center cursor-pointer group"
        onDoubleClick={onDoubleClick}
      >
        <Card className="p-8 text-center border-2 border-dashed border-pip-border/50 hover:border-pip-green-secondary/50 transition-colors bg-pip-bg-secondary/20">
          <p className="text-pip-text-secondary font-pip-mono text-sm mb-2">
            No widgets found for {tab}
          </p>
          <p className="text-pip-text-muted text-xs">
            Use the left drawer to add widgets
          </p>
        </Card>
      </div>
    );
  }

  if (!displayWidget) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center border-pip-border bg-pip-bg-secondary/20">
          <p className="text-pip-text-secondary font-pip-mono text-sm">
            Select a widget from the left drawer
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className || ''}`}>
      {/* Full-space single widget display */}
      <div className="h-full">
        {renderWidgetContent(displayWidget)}
      </div>
    </div>
  );
});