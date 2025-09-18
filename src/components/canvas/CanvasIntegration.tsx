import React, { useState, memo } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StandardWidgetTemplate } from '@/components/widgets/templates/WidgetTemplate';
import { WidgetInstanceSettingsModal } from '@/components/widgets/WidgetInstanceSettingsModal';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TestWidget } from '@/components/widgets/TestWidget';
import { AtomicClockWidget } from '@/components/widgets/AtomicClockWidget';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserWidget } from '@/hooks/useWidgetManager';

// Widget descriptions mapping
const widgetDescriptions: Record<string, string> = {
  'test_widget': 'A simple test widget for demonstration purposes',
  'atomic_clock': 'Multi-timezone atomic clock with alarms, themes, and retro visual effects',
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
  const [settingsWidget, setSettingsWidget] = useState<UserWidget | null>(null);

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

  const handleSettings = (widget: UserWidget) => {
    setSettingsWidget(widget);
  };

  const handleSaveSettings = async (widgetId: string, config: any) => {
    await onUpdateWidget(widgetId, { widget_config: config });
    setSettingsWidget(null);
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
            widget={null} // Remove circular dependency
            onRemove={undefined} // Managed by parent
            onToggleCollapse={undefined} // Managed by parent
            onToggleFullWidth={undefined} // Managed by parent
            onOpenSettings={undefined} // Managed by parent
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
            widget={null} // Remove circular dependency
            onRemove={undefined} // Managed by parent
            onToggleCollapse={undefined} // Managed by parent
            onToggleFullWidth={undefined} // Managed by parent
            onOpenSettings={undefined} // Managed by parent
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
      <div className="grid gap-4 auto-rows-max">
        {widgets.map((widget) => (
          <StandardWidgetTemplate
            key={widget.id}
            widget={widget}
            onRemove={() => handleCloseWidget(widget.id)}
            onToggleCollapse={() => handleToggleCollapse(widget)}
            onToggleFullWidth={() => handleToggleFullWidth(widget)}
            onOpenSettings={() => handleSettings(widget)}
            selfWrapped={true} // CanvasIntegration manages the widget shell
          >
            {/* Widget Content */}
            {renderWidgetContent(widget)}
          </StandardWidgetTemplate>
        ))}
      </div>

      {/* Settings Modal */}
      <WidgetInstanceSettingsModal
        open={!!settingsWidget}
        onClose={() => setSettingsWidget(null)}
        widget={settingsWidget}
        onSave={handleSaveSettings}
      />
    </div>
  );
});