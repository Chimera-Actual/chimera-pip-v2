import React, { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { WidgetRenderer } from '@/components/widgets/WidgetRegistry';
import { BaseWidget, WidgetWidth } from '@/types/widgets';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  widget: BaseWidget;
  onUpdate: (id: string, updates: Partial<BaseWidget>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleWidth: (widget: BaseWidget) => void;
  isMobile: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  widget, 
  onUpdate, 
  onDelete, 
  onArchive, 
  onToggleWidth, 
  isMobile 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleChange = useCallback((newTitle: string) => {
    onUpdate(widget.id, { title: newTitle });
  }, [widget.id, onUpdate]);

  const handleIconChange = useCallback((newIcon: string) => {
    onUpdate(widget.id, { customIcon: newIcon });
  }, [widget.id, onUpdate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        widget.widgetWidth === 'full' ? 'col-span-2' : 'col-span-1'
      )}
    >
      <WidgetContainer
        widgetId={widget.id}
        widgetType={widget.type}
        title={widget.title}
        customIcon={widget.customIcon}
        widgetWidth={widget.widgetWidth}
        collapsed={widget.collapsed}
        onToggleCollapse={() => onUpdate(widget.id, { collapsed: !widget.collapsed })}
        onSettingsChange={(settings) => onUpdate(widget.id, { settings })}
        onTitleChange={handleTitleChange}
        onIconChange={handleIconChange}
        onToggleWidth={() => onToggleWidth(widget)}
        onDelete={() => onDelete(widget.id)}
        onArchive={() => onArchive(widget.id)}
        onMove={undefined}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <WidgetRenderer widget={widget} />
      </WidgetContainer>
    </div>
  );
};