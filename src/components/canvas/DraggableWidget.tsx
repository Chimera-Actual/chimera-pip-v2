import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { UserWidget } from '@/hooks/useWidgetManager';

interface DraggableWidgetProps {
  widget: UserWidget;
  children: React.ReactNode;
  editMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  editMode = false,
  className = '',
  style,
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

  const dragStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    ...style,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`${className} ${isDragging ? 'z-50 opacity-50' : ''}`}
      {...attributes}
      {...(editMode ? listeners : {})}
    >
      {children}
    </div>
  );
};