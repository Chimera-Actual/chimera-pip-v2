import React, { useRef, useState, useEffect } from 'react';
import { GripHorizontal, GripVertical, Move } from 'lucide-react';

interface ResizeHandleProps {
  onResize: (direction: 'width' | 'height' | 'both', delta: number) => void;
  disabled?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize, disabled }) => {
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const resizeDirection = useRef<'width' | 'height' | 'both'>('width');

  const handleMouseDown = (e: React.MouseEvent, direction: 'width' | 'height' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeDirection.current = direction;
    startPos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      
      // Only trigger resize when movement is significant enough (grid-based)
      if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        let delta = 0;
        
        if (direction === 'width') {
          delta = deltaX > 0 ? 1 : -1;
        } else if (direction === 'height') {
          delta = deltaY > 0 ? 1 : -1;
        } else { // both
          delta = (deltaX > 0 || deltaY > 0) ? 1 : -1;
        }
        
        onResize(direction, delta);
        startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (disabled) return null;

  return (
    <div className="absolute bottom-1 right-1 flex gap-1 z-10">
      {/* Width resize handle */}
      <button
        className={`w-4 h-4 bg-pip-bg-tertiary border border-pip-border rounded opacity-70 hover:opacity-100 transition-opacity cursor-ew-resize flex items-center justify-center ${
          isResizing && resizeDirection.current === 'width' ? 'bg-pip-primary/20 scale-110' : ''
        }`}
        onMouseDown={(e) => handleMouseDown(e, 'width')}
        title="Resize width"
      >
        <GripHorizontal className="w-3 h-3" />
      </button>
      
      {/* Height resize handle */}
      <button
        className={`w-4 h-4 bg-pip-bg-tertiary border border-pip-border rounded opacity-70 hover:opacity-100 transition-opacity cursor-ns-resize flex items-center justify-center ${
          isResizing && resizeDirection.current === 'height' ? 'bg-pip-primary/20 scale-110' : ''
        }`}
        onMouseDown={(e) => handleMouseDown(e, 'height')}
        title="Resize height"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      
      {/* Corner resize handle */}
      <button
        className={`w-4 h-4 bg-pip-bg-tertiary border border-pip-border rounded opacity-70 hover:opacity-100 transition-opacity cursor-nw-resize flex items-center justify-center ${
          isResizing && resizeDirection.current === 'both' ? 'bg-pip-primary/20 scale-110' : ''
        }`}
        onMouseDown={(e) => handleMouseDown(e, 'both')}
        title="Resize both"
      >
        <Move className="w-3 h-3" />
      </button>
    </div>
  );
};