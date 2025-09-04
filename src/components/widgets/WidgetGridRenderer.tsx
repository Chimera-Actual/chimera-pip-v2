import React from 'react';
import { BaseWidget } from '@/types/widgets';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';

interface WidgetGridRendererProps {
  widgets: BaseWidget[];
  onToggleCollapse: (widgetId: string) => void;
  onSettingsChange: (widgetId: string, settings: any) => void;
  onDelete?: (widgetId: string) => void;
  onMove?: (widgetId: string, position: { x: number; y: number }) => void;
  onResize?: (widgetId: string, size: { width: number; height: number }) => void;
}

export const WidgetGridRenderer: React.FC<WidgetGridRendererProps> = ({
  widgets,
  onToggleCollapse,
  onSettingsChange,
  onDelete,
  onMove,
  onResize
}) => {
  return (
    <div className="widget-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {widgets.map(widget => (
        <WidgetContainer
          key={widget.id}
          widgetId={widget.id}
          widgetType={widget.type}
          title={widget.title}
          collapsed={widget.collapsed}
          onToggleCollapse={() => onToggleCollapse(widget.id)}
          onSettingsChange={(settings) => onSettingsChange(widget.id, settings)}
          onDelete={onDelete ? () => onDelete(widget.id) : undefined}
          onMove={onMove ? () => onMove(widget.id, { x: 0, y: 0 }) : undefined}
          onResize={onResize ? () => onResize(widget.id, { width: 300, height: 200 }) : undefined}
        >
          <WidgetRenderer widget={widget} />
        </WidgetContainer>
      ))}
    </div>
  );
};