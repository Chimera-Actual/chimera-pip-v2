import React from 'react';
import { BaseWidget } from '@/types/widgets';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';
import { cn } from '@/lib/utils';

interface WidgetSettingsUpdate {
  [key: string]: string | number | boolean | string[];
}

interface WidgetGridRendererProps {
  widgets: BaseWidget[];
  onToggleCollapse: (widgetId: string) => void;
  onSettingsChange: (widgetId: string, settings: WidgetSettingsUpdate) => void;
  onDelete?: (widgetId: string) => void;
  onArchive?: (widgetId: string) => void;
  onMove?: (widgetId: string, position: { x: number; y: number }) => void;
  onToggleWidth?: (widget: BaseWidget) => void;
}

export const WidgetGridRenderer: React.FC<WidgetGridRendererProps> = ({
  widgets,
  onToggleCollapse,
  onSettingsChange,
  onDelete,
  onArchive,
  onMove,
  onToggleWidth
}) => {
  return (
    <div className="widget-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {widgets.map(widget => (
        <div 
          key={widget.id}
          className={cn(
            widget.widgetWidth === 'full' ? 'md:col-span-2 lg:col-span-3' : 'col-span-1'
          )}
        >
          <WidgetContainer
            widgetId={widget.id}
            widgetType={widget.type}
            title={widget.title}
            collapsed={widget.collapsed}
            customIcon={widget.customIcon}
            widgetWidth={widget.widgetWidth}
            onToggleCollapse={() => onToggleCollapse(widget.id)}
            onSettingsChange={(settings) => onSettingsChange(widget.id, settings)}
            onDelete={onDelete ? () => onDelete(widget.id) : undefined}
            onArchive={onArchive ? () => onArchive(widget.id) : undefined}
            onMove={onMove ? () => onMove(widget.id, { x: 0, y: 0 }) : undefined}
            onToggleWidth={onToggleWidth ? () => onToggleWidth(widget) : undefined}
          >
            <WidgetRenderer widget={widget} />
          </WidgetContainer>
        </div>
      ))}
    </div>
  );
};