import React, { useState, memo } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';



import { TestWidget } from '@/components/widgets/TestWidget';
import { AtomicClockWidget } from '@/components/widgets/AtomicClockWidget';
import { WeatherDashboardWidget } from '@/components/widgets/WeatherDashboardWidget';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserWidget } from '@/hooks/useWidgetManager';

// Widget descriptions mapping
const widgetDescriptions: Record<string, string> = {
  'test_widget': 'A simple test widget for demonstration purposes',
  'atomic_clock': 'Multi-timezone atomic clock with alarms, themes, and retro visual effects',
  'weather_dashboard': 'Complete weather station with current conditions, forecast, air quality, and Pip-Boy radiation mode',
  // Add more widget descriptions as needed
};

interface CanvasIntegrationProps {
  tab: string;
  widgets: UserWidget[];
  isLoading: boolean;
  className?: string;
  onDoubleClick?: () => void;
  onDeleteWidget: (widgetId: string) => Promise<boolean>;
  onUpdateWidget: (widgetId: string, updates: Partial<UserWidget>) => Promise<boolean>;
  onToggleCollapsed: (widget: UserWidget) => Promise<boolean>;
}

export const CanvasIntegration = memo<CanvasIntegrationProps>(({ 
  tab, 
  widgets,
  isLoading,
  className, 
  onDoubleClick,
  onDeleteWidget,
  onUpdateWidget,
  onToggleCollapsed
}) => {
  

  // Widget interaction handlers with optimistic updates
  const handleCloseWidget = async (widgetId: string) => {
    await onDeleteWidget(widgetId);
  };

  const handleToggleCollapse = async (widget: UserWidget) => {
    await onToggleCollapsed(widget);
  };

  const handleToggleFullWidth = async (widget: UserWidget) => {
    const newWidth = widget.widget_width === 'full' ? 'half' : 'full';
    await onUpdateWidget(widget.id, { widget_width: newWidth });
  };


  const handleSaveSettings = async (widgetId: string, config: any) => {
    await onUpdateWidget(widgetId, { widget_config: config });
  };

  const renderWidgetContent = (widget: UserWidget) => {
    const normalizedType = (widget.widget_type || '').toLowerCase().replace(/[^a-z]/g, '');
    switch (normalizedType) {
      case 'test':
      case 'testwidget':
        return (
          <TestWidget
            title={widget.widget_config?.title || 'Test Widget'}
            settings={widget.widget_config || {}}
            onSettingsChange={(settings) => handleSaveSettings(widget.id, settings)}
            widget={widget}
            onRemove={() => handleCloseWidget(widget.id)}
            onToggleCollapse={() => handleToggleCollapse(widget)}
            onToggleFullWidth={() => handleToggleFullWidth(widget)}
          />
        );
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
  };

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
            Double-click to add your first widget
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-4 py-4 ${className || ''}`}>
      {/* Widget Grid - Fixed layout that doesn't affect parent height */}
      <div className="grid grid-cols-2 gap-4 auto-rows-max">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={widget.widget_width === 'full' ? 'col-span-2' : 'col-span-1'}
          >
            {renderWidgetContent(widget)}
          </div>
        ))}
      </div>

    </div>
  );
});