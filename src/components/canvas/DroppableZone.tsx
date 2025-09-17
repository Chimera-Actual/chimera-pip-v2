import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  gridPosition: { x: number; y: number };
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  gridPosition,
  children,
  className = '',
  style,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      gridPosition,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? 'border-pip-primary/80 bg-pip-primary/10' : ''
      } transition-all duration-200`}
      style={style}
    >
      {children}
    </div>
  );
};