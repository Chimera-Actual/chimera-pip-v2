import React from 'react';
import { GripHorizontal, GripVertical, Move } from 'lucide-react';

interface ResizeHandleProps {
  onResize: (direction: 'width' | 'height' | 'both', delta: number) => void;
  disabled?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize, disabled }) => {
  if (disabled) return null;

  return (
    <div className="absolute bottom-1 right-1 flex gap-1">
      {/* Width resize handle */}
      <button
        className="w-4 h-4 bg-pip-bg-tertiary border border-pip-border rounded opacity-70 hover:opacity-100 transition-opacity cursor-ew-resize flex items-center justify-center"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Handle horizontal resize
        }}
        title="Resize width"
      >
        <GripHorizontal className="w-3 h-3" />
      </button>
      
      {/* Height resize handle */}
      <button
        className="w-4 h-4 bg-pip-bg-tertiary border border-pip-border rounded opacity-70 hover:opacity-100 transition-opacity cursor-ns-resize flex items-center justify-center"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Handle vertical resize
        }}
        title="Resize height"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      
      {/* Corner resize handle */}
      <button
        className="w-4 h-4 bg-pip-bg-tertiary border border-pip-border rounded opacity-70 hover:opacity-100 transition-opacity cursor-nw-resize flex items-center justify-center"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Handle both directions
        }}
        title="Resize both"
      >
        <Move className="w-3 h-3" />
      </button>
    </div>
  );
};