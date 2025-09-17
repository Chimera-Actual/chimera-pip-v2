import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { UserWidget } from '@/hooks/useWidgetManager';

interface DraggableWidgetProps {
  widget: UserWidget;
  children: React.ReactNode;
  editMode?: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  editMode = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: widget.id,
    disabled: !editMode,
    data: {
      widget,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-50 opacity-50' : ''}`}
      {...attributes}
      {...(editMode ? listeners : {})}
    >
      {children}
    </div>
  );
};