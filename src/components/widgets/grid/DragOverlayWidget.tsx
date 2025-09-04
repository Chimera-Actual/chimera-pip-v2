import React, { memo } from 'react';
import { WidgetContainer } from '../WidgetContainer';
import { WidgetRenderer } from '../WidgetRegistry';
import { BaseWidget } from '@/types/widgets';
import { cn } from '@/lib/utils';

interface DragOverlayWidgetProps {
  widget: BaseWidget;
  onUpdate: (id: string, updates: Partial<BaseWidget>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleWidth: (widget: BaseWidget) => void;
}

export const DragOverlayWidget: React.FC<DragOverlayWidgetProps> = memo(({
  widget,
  onUpdate,
  onDelete,
  onArchive,
  onToggleWidth
}) => {
  return (
    <div className={cn(
      "bg-background border border-border rounded-lg shadow-lg opacity-80",
      widget.widgetWidth === 'full' ? 'w-full' : 'w-1/2'
    )}>
      <WidgetContainer
        widgetId={widget.id}
        widgetType={widget.type}
        title={widget.title}
        customIcon={widget.customIcon}
        widgetWidth={widget.widgetWidth}
        collapsed={widget.collapsed}
        onToggleCollapse={() => onUpdate(widget.id, { collapsed: !widget.collapsed })}
        onSettingsChange={(settings) => onUpdate(widget.id, { settings })}
        onTitleChange={(newTitle) => onUpdate(widget.id, { title: newTitle })}
        onIconChange={(newIcon) => onUpdate(widget.id, { customIcon: newIcon })}
        onToggleWidth={() => onToggleWidth(widget)}
        onDelete={() => onDelete(widget.id)}
        onArchive={() => onArchive(widget.id)}
        onMove={undefined}
      >
        <WidgetRenderer widget={widget} />
      </WidgetContainer>
    </div>
  );
});

DragOverlayWidget.displayName = 'DragOverlayWidget';